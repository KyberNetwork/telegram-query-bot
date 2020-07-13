const Extra = require('telegraf/extra');
const fs = require('fs');

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));


function isZero(rate) {
  return (rate == 0);
}

async function debugReserve(ethAddress, tokenAddress, buyQty, sellQty, reserve, pricing, ethers, provider) {
  let finalMessage = ``;
  let buyMessage = await checkRate(true, ethAddress, tokenAddress, buyQty, reserve, pricing, ethers, provider);
  finalMessage += buyMessage;

  let sellMessage = await checkRate(false, tokenAddress, ethAddress, sellQty, reserve, pricing, ethers, provider);
  finalMessage += sellMessage;

  return finalMessage;
}

async function checkRate(isBuy, srcAddress, destAddress, qty, reserve, pricing, ethers, provider) {
  let tokenAddress;
  let isBuyText;
  if (isBuy) {
    isBuyText = 'buy';
    tokenAddress = destAddress;
  } else {
    isBuyText = 'sell';
    tokenAddress = srcAddress;
  }

  let rate = await reserve.getConversionRate(
    srcAddress,
    destAddress,
    qty.toString(),
    0);

  if (isZero(rate)) {
    rate = await pricing.getRate(
      tokenAddress,
      0,
      isBuy,
      qty.toString()
    );

    if (isZero(rate)) {
      return `*Pricing contract returns zero ${isBuyText} rate.\n*`;
    } else {
      return await verifyDestLimits(srcAddress, destAddress, qty, rate, reserve, ethers, provider);
    }
  } else {
    return `${isBuyText} rate: ${rate}\n`;
  }
}

async function verifyDestLimits(srcAddress, destAddress, qty, rate, reserve, ethers, provider) {
  let destQty = await reserve.getDestQty(
    srcAddress,
    destAddress,
    qty.toString(),
    rate.toString()
  );

  let balance = await reserve.getBalance(destAddress);
  if (isZero(balance)) {
    if (destAddress == ETH_ADDRESS) {
      return `*Reserve has no ETH.*`;
    }

    let wallet = reserve.tokenWallet(destAddress);
    let tokenInstance = new ethers.Contract(destAddress, tokenABI, provider);

    let balanceOfWallet = await tokenInstance.balanceOf(wallet);
    if (isZero(balanceOfWallet)) {
      return `*Token wallet ${wallet} has insufficient token balance.*`;
    } else {
      return `*Token wallet ${wallet} has insufficient token allowance given to reserve*`;
    }
  }

  if (balance.lt(destQty)) {
    return `*Dest amount greater than balance.*\nBalance: ${balance}\nDest Qty: ${destQty}`;
  }

  return `*Rate exceeds sanity rates*`;
}

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 2) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 2 provided.`);
      return;
    }

    let srcToken = args[0];
    let reserveAddress = args[1];
    let network = (args[2]) ? args[2].toLowerCase() : 'mainnet';
    
    const {ethers: ethers, provider: provider} = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const convRateABI = JSON.parse(fs.readFileSync('src/contracts/abi/ConversionRatesInterface.abi', 'utf8'));

    if (
      !srcToken.startsWith('0x') &&
      (['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1)
    ) {
      srcToken = currencies.find(o => o.symbol === srcToken.toUpperCase());
    } else if (
      srcToken.length === 42 &&
      srcToken.startsWith('0x')
    ) {
      srcToken = { address: srcToken };
    } else {
      srcToken = undefined;
    }

    if (!srcToken) {
      reply('Invalid source token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    const reserveInstance = new ethers.Contract(reserveAddress, reserveABI, provider);
    const pricingInstance = new ethers.Contract(
      await reserveInstance.conversionRatesContract(),
      convRateABI,
      provider
    );

    let tradeEnabled = await reserveInstance.tradeEnabled();
    if (!tradeEnabled) {
      reply('Reserve trade not enabled.', inReplyTo(message.message_id));
      return;
    }

    const BUY_QTY = ethers.utils.parseEther('0.5');
    const SELL_QTY = 10 * 10 ** srcToken.decimals;

    let result = await debugReserve(
      ETH_ADDRESS,
      srcToken.address,
      BUY_QTY, SELL_QTY,
      reserveInstance,
      pricingInstance,
      ethers,
      provider
    );
    replyWithMarkdown(`${result}`, inReplyTo(message.message_id));
    return;
  };
};
