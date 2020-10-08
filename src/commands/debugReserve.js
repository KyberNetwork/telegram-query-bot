const Extra = require('telegraf/extra');
const fs = require('fs');
const ethers = require('ethers');
const BN = ethers.BigNumber;

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const tokenABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
);
const reserveABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8')
);
const liqRateABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/LiquidityConversionRates.abi', 'utf8')
);
const convRateABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/ConversionRates.abi', 'utf8')
);
const sanityRateABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/SanityRates.abi', 'utf8')
);

async function debugReserve(
  reserve,
  pricing,
  token,
  isAPR,
  provider
) {
  let result;
  let finalMessage = '';

  result = await checkReserveAddress(reserve.address, pricing);
  if (result != '') return result;

  result = await fetchCheckRates(
    await provider.getBalance(reserve.address),
    isAPR,
    pricing,
    token,
    provider
  );

  finalMessage += result.finalMessage;
  if (result.isValid) {
    finalMessage += await checkReserveSettings(
      reserve,
      pricing,
      token,
      provider
    );
  }

  return finalMessage;
}

async function checkReserveAddress(reserveAddress, pricing) {
  let actualReserveAddress = await pricing.reserveContract();
  return (actualReserveAddress.toLowerCase() != reserveAddress.toLowerCase()) ?
    'Pricing not pointing to correct reserve address. Call setReserveAddress()' :
    '';
}

async function fetchCheckRates(
  reserveEthBalance,
  isAPR,
  pricing,
  token,
  provider
) {
  const SRC_QTY = ethers.utils.parseEther('0.5');
  let finalMessage = '';

  let currentBlockNumber = await provider.getBlockNumber();
  // check buy rate first
  let rate = await pricing.getRate(
    token.address,
    currentBlockNumber,
    true, // buy
    SRC_QTY,
  );

  if (rate.isZero()) {
    if (isAPR) {
      finalMessage = await debugAPRRate(
        reserveEthBalance,
        pricing,
        token.address,
        SRC_QTY,
        rate,
        true,
      );
    } else {
      finalMessage = await debugFPRRate(
        pricing,
        token,
        provider
      );
    }
    return {isValid: false, finalMessage: finalMessage};
  } else {
    finalMessage = `pricing buy rate: ${rate}\n`;
  }

  let srcQty = new BN.from(
    calcDstQty(
      SRC_QTY,
      18,
      token.tokenDecimals,
      rate
    )
  );

  // check sell rate
  rate = await pricing.getRate(
    token.address,
    currentBlockNumber,
    false, // sell
    srcQty,
  );

  if (rate.isZero()) {
    if (isAPR) {
      finalMessage += await debugAPRRate(
        reserveEthBalance,
        pricing,
        token.address,
        srcQty,
        rate,
        false
      );
    } else {
      finalMessage += await debugFPRRate(
        pricing,
        token,
        provider
      );
    }
    return {isValid: false, finalMessage: finalMessage};
  } else {
    finalMessage += `pricing sell rate: ${rate}\n`;
    return {isValid: true, finalMessage: finalMessage};
  }
}

function calcDstQty(srcQty, srcDecimals, dstDecimals, rate) {
  const PRECISION = BN.from(10).pow(BN.from(18));
  if (dstDecimals >= srcDecimals) {
    return (srcQty.mul(rate).mul(BN.from(10).pow(BN.from(dstDecimals - srcDecimals)))).div(PRECISION);
  } else {
    return (srcQty.mul(rate)).div(PRECISION.mul(BN.from(10).pow(BN.from(srcDecimals - dstDecimals))));
  }
}

async function debugAPRRate(
  reserveEthBalance,
  pricing,
  tokenAddress,
  srcQty,
  rate,
  isBuy
) {
  let result;
  let eInFp = await pricing.fromWeiToFp(reserveEthBalance);
  rate = await pricing.getRateWithE(tokenAddress, isBuy, srcQty, eInFp);
  if(rate.isZero()) {
    result = await validateEInFp(reserveEthBalance, pricing, ethers.utils.parseUnits('10000000000'));
    if (!result.isValid) return result.finalMessage;

    result = await checkDelta(pricing, srcQty, isBuy, ethers.constants.Two);
    if (!result.isValid) return result.finalMessage;

    result = await getRateWithDelta(
      result.deltaInFp,
      reserveEthBalance,
      pricing,
      srcQty,
      isBuy
    );
    if (!result.isValid) return result.finalMessage;

    if (result.rateInPrecision) {
      return await validateRate(
        pricing,
        result.rateInPrecision,
        isBuy
      );
    }
  } else {
    return `rate ${rate} > 1e25`;
  }
}

async function validateEInFp(reserveBalance, pricing, maxQty) {
  let result = {
    isValid: true,
    finalMessage: ''
  };
  let eInFp = await pricing.fromWeiToFp(reserveBalance);
  let maxQtyInFp = await pricing.fromWeiToFp(maxQty);

  if (eInFp.gt(maxQtyInFp)) {
    result.isValid = false;
    result.finalMessage = 'eInFp (Ether balance) too large, exceeds maxQtyInFp.' + 
    'Try withdrawing some ETH.';
  }
  return result;
}

async function checkDelta(pricing, srcQty, isBuy, twoBN) {
  let result = {
    isValid: true,
    deltaInFp: 0,
    finalMessage: ''
  };

  if (isBuy) {
    let maxEthCapBuyInFp = await pricing.maxEthCapBuyInFp();
    if (maxEthCapBuyInFp.isZero()) {
      result.isValid = false;
      result.finalMessage = 'Max buy amt is zero. Reset liquidity params with higher max buy amt';
      return result;
    }

    let tempSrcQty = srcQty;
    result.deltaInFp = await pricing.fromWeiToFp(tempSrcQty);
    while (result.deltaInFp.gt(maxEthCapBuyInFp)) {
      // use smaller srcQty
      tempSrcQty = tempSrcQty.div(twoBN);
      result.deltaInFp = await pricing.fromWeiToFp(tempSrcQty);
    }
  } else {
    let sellInputTokenQtyInFp = await pricing.fromTweiToFp(srcQty);
    result.deltaInFp = await pricing.valueAfterReducingFee(sellInputTokenQtyInFp);
  }
  return result;
}

async function getRateWithDelta(
  delta,
  reserveEthBalance,
  pricing,
  srcQty,
  isBuy
) {
  let result = {
    isValid: true,
    rateInPrecision: BN.from(0),
    finalMessage: ''
  };

  let eInFp = await pricing.fromWeiToFp(reserveEthBalance);
  if (isBuy) {
    if (delta.isZero()) {
      result.rateInPrecision = await pricing.buyRateZeroQuantity(eInFp);
    } else {
      result.rateInPrecision = await pricing.buyRate(eInFp, delta);
    }
  } else {
    let maxEthCapSellInFp = await pricing.maxEthCapSellInFp();
    if (maxEthCapSellInFp.isZero()) {
      result.isValid = false;
      result.finalMessage = 'Max sell amt is zero. Reset liquidity params with higher max sell amt';
      return result;
    }

    let sellInputTokenQtyInFp = await pricing.fromTweiToFp(srcQty);
    let deltaEInFp;
    if (delta.isZero()) {
      result.rateInPrecision = await pricing.sellRateZeroQuantity(eInFp);
      deltaEInFp = BN.from(0);
    } else {
      let tempSellInputTokenQtyInFp = sellInputTokenQtyInFp;
      let sellRateResult = await pricing.sellRate(eInFp, tempSellInputTokenQtyInFp, delta);
      result.rateInPrecision = sellRateResult.rateInPrecision;
      deltaEInFp = sellRateResult.deltaEInFp;
      while (deltaEInFp.gt(maxEthCapSellInFp)) {
        // user smaller srcQty
        tempSellInputTokenQtyInFp = tempSellInputTokenQtyInFp.div(BN.from(2));
        sellRateResult = await pricing.sellRate(eInFp, tempSellInputTokenQtyInFp, delta);
        result.rateInPrecision = sellRateResult.rateInPrecision;
        deltaEInFp = sellRateResult.deltaEInFp;
      }
    }
  }
  return result;
}

async function validateRate(pricing, rateInPrecision, isBuy) {
  let minAllowRate;
  let maxAllowRate;
  if (isBuy) {
    minAllowRate = await pricing.minBuyRateInPrecision();
    maxAllowRate = await pricing.maxBuyRateInPrecision();
  } else {
    minAllowRate = await pricing.minSellRateInPrecision();
    maxAllowRate = await pricing.maxSellRateInPrecision();
  }

  let startErrorText = isBuy ? 'Buy' : 'Sell';
  if (rateInPrecision.gt(maxAllowRate)) {
    return startErrorText + ' rate in precision > max allowed rate. ' + 
    'Price ceiling reached; reset liquidity params.';
    
  } else if (rateInPrecision.lt(minAllowRate)) {
    return startErrorText + ' rate in precision < min allowed rate. ' +
    'Price floor reached; reset liquidity params.';
  }

  return 'Rate in precision > 10M token per ETH';
}

async function debugFPRRate(
  pricing,
  token,
  provider
) {
  let tokenBasicData = await pricing.getTokenBasicData(token.address);
  if (!tokenBasicData[0]) return 'Token not listed. Call addToken()\n';
  if (!tokenBasicData[1]) return 'Trade not enabled. Call enableTokenTrade()\n';

  let rateUpdateBlock = await pricing.getRateUpdateBlock(token.address);
  let validRateDurationInBlocks = await pricing.validRateDurationInBlocks();
  let currentBlockNumber = await provider.getBlockNumber();
  if (currentBlockNumber.gte(rateUpdateBlock.add(validRateDurationInBlocks))) {
    return 'Rate has expired. Kindly reset rates';
  }
  
  let basicRate = await pricing.getBasicRate(token.address, true);
  if (basicRate.isZero()) return 'No buy rate set';
  basicRate = await pricing.getBasicRate(token.address, false);
  if (basicRate.isZero()) return 'No sell rate set';

  for (let i = 14; i >= 0; i -= 2) {
    let stepLength = await pricing.getStepFunctionData(token.address, i, 0);
    if (stepLength.isZero()) {
      let msg = (i >= 6) ?
        'Rate imbalance step function not set' :
        'Rate qty step function not set';
      return msg;
    }
  }
  return 'Exceeded imbalance';
}

async function checkReserveSettings(
  reserve,
  pricing,
  token,
  provider
) {
  // check token wallet
  let tokenWallet;
  try {
    tokenWallet = await reserve.tokenWallet(token.address);
    if (tokenWallet == ethers.constants.AddressZero) {
      return 'Token wallet not set; kindly call approveWithdrawAddress for token.';
    }
  } catch (e) {
    tokenWallet = reserve.address;
  }

  let balanceEther = await reserve.getBalance(ETH_ADDRESS);
  if (balanceEther.isZero()) return 'Reserve has no ETH.';

  let balanceToken = await reserve.getBalance(token.address);
  if (balanceToken.isZero()) {
    let walletBalance = await token.balanceOf(tokenWallet);
    if (walletBalance.isZero()) {
      return `*Token wallet ${tokenWallet} has insufficient token balance.*`;
    } else {
      return `*Token wallet ${tokenWallet} has insufficient token allowance given to reserve*`;
    }
  }

  const SRC_QTY = ethers.utils.parseEther('0.5');
  let currentBlockNumber = await provider.getBlockNumber();
  let rate = await pricing.getRate(
    token.address,
    currentBlockNumber,
    true, // buy
    SRC_QTY,
  );

  let destQty = await reserve.getDestQty(
    ETH_ADDRESS,
    token.address,
    SRC_QTY,
    rate
  );

  if (balanceToken.lt(destQty)) {
    return `*Token dst qty > token balance.*\nBalance: ${balanceToken}\nDest Qty: ${destQty}`;
  }

  let sanityRateAddress = await reserve.sanityRatesContract();
  if (sanityRateAddress != ethers.constants.AddressZero) {
    let sanityRatesContract = new ethers.Contract(sanityRateAddress, sanityRateABI, provider);
    let sanityRate = await sanityRatesContract.getSanityRate(ETH_ADDRESS, token.address);
    if (rate.gt(sanityRate)) return '*E2T rate exceeds sanity rates*';
  }

  rate = await pricing.getRate(
    token.address,
    currentBlockNumber,
    false, // buy
    destQty,
  );

  destQty = await reserve.getDestQty(
    token.address,
    ETH_ADDRESS,
    destQty,
    rate
  );

  if (balanceEther.lt(destQty)) {
    return `*Eth dest qty > Eth balance.*\nBalance: ${balanceEther}\nDest Qty: ${destQty}`;
  }

  sanityRateAddress = await reserve.sanityRatesContract();
  if (sanityRateAddress != ethers.constants.AddressZero) {
    let sanityRatesContract = new ethers.Contract(sanityRateAddress, sanityRateABI, provider);
    let sanityRate = await sanityRatesContract.getSanityRate(token.address, ETH_ADDRESS);
    if (rate.gt(sanityRate)) return '*T2E rate exceeds sanity rates*';
  }

  return '*reserve returns rates*\n';
}

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`
      );
      return;
    }

    let reserveID = args[0];
    let token;
    let tempToken;
    let isAPR = false;
    let network;
    if (args[1]) {
      if (helpers.networks.includes(args[1].toLowerCase())) {
        network = args[1].toLowerCase();
      } else {
        token = args[1];
      }
    } else {
      token = '';
    }

    network = args[2] ? args[2].toLowerCase() : 'mainnet';

    const { provider } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    
    if (
      !token.startsWith('0x') &&
      helpers.networks.indexOf(network) !== -1
    ) {
      token = currencies.find((o) => o.symbol === token.toUpperCase());
      if (token) token.tokenDecimals = token.decimals;
    } else if (token.length === 42 && token.startsWith('0x')) {
      token = new ethers.Contract(
        token,
        tokenABI,
        provider
      );
      token.tokenDecimals = await token.decimals();
    } else {
      token = undefined;
    }

    let reserveAddress;
    if (!ethers.utils.isAddress(reserveID)) {
      let getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsById'
      );
      reserveAddress = (await getReserveInfo(helpers.to32Bytes(reserveID))).reserveAddress;
      if (reserveAddress == ethers.constants.AddressZero) {
        reply(
          'Null reserve address. Check reserve ID used.',
          inReplyTo(message.message_id)
        );
        return;
      }
    } else {
      reserveAddress = reserveID;
    }

    const reserveInstance = new ethers.Contract(
      reserveAddress,
      reserveABI,
      provider
    );
    let pricingInstance;
    let pricingAddress = await reserveInstance.conversionRatesContract();
    pricingInstance = new ethers.Contract(
      pricingAddress,
      liqRateABI,
      provider
    );

    try {
      tempToken = new ethers.Contract(
        await pricingInstance.token(),
        tokenABI,
        provider
      );
      tempToken.tokenDecimals = await tempToken.decimals();
      isAPR = true;
    } catch (e) {
      pricingInstance = new ethers.Contract(
        pricingAddress,
        convRateABI,
        provider
      );
    }

    token = tempToken ? tempToken : token;
    if (!token) {
      reply(
        'Invalid source token symbol or address.',
        inReplyTo(message.message_id)
      );
      return;
    }

    let result = await debugReserve(
      reserveInstance,
      pricingInstance,
      token,
      isAPR,
      provider
    );

    replyWithMarkdown(result, inReplyTo(message.message_id));
    return;
  };
};
