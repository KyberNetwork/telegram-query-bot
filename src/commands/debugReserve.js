const Extra = require('telegraf/extra');
const fs = require('fs');

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));


function isZero(rate) {
  return (rate == 0);
}

async function debugReserve(ethAddress, tokenAddress, buyQty, sellQty, reserve, pricing) {
  finalMessage = ``;
  buyMessage = await checkRate(true, ethAddress, tokenAddress, buyQty, reserve, pricing);
  finalMessage += buyMessage;

  sellMessage = await checkRate(false, tokenAddress, ethAddress, sellQty, reserve, pricing);
  finalMessage += sellMessage;
  return finalMessage;
}

async function checkRate(isBuy, srcAddress, destAddress, qty, reserve, pricing) {
  if (isBuy) {
    isBuyText = `buy`;
    tokenAddress = destAddress;
  } else {
    isBuyText = 'sell';
    tokenAddress = srcAddress;
  }

  rate = await reserve.methods.getConversionRate(
    srcAddress,
    destAddress,
    qty.toString(),
    0).call()

  if (isZero(rate)) {
    rate = await pricing.methods.getRate(
      tokenAddress,
      0,
      isBuy,
      qty.toString()
    ).call();

    if (isZero(rate)) {
      return `*Pricing contract returns zero ${isBuyText} rate.\n*`;
    } else {
      return await verifyDestLimits(srcAddress, destAddress, qty, rate, reserve, pricing);
    }
  } else {
    return `${isBuyText} rate: ${rate}\n`;
  }
}

async function verifyDestLimits(srcAddress, destAddress, qty, rate, reserve, pricing) {
  destQty = await reserve.methods.getDestQty(
    srcAddress,
    destAddress,
    qty.toString(),
    rate.toString()
  ).call();

  balance = await reserve.methods.getBalance(destAddress).call();
  if (isZero(balance)) {
    if (destAddress == ETH_ADDRESS) {
      return `*Reserve has no ETH.*`;
    }

    wallet = reserve.methods.tokenWallet(destAddress).call();
    tokenInstance = new web3.eth.Contract(tokenABI,destAddress);

    balanceOfWallet = await tokenInstance.methods.balanceOf(wallet).call();
    allowanceOfWallet = await tokenInstance.methods.allowance(wallet,reserve.options.address);
    if (isZero(balanceOfWallet)) {
      return `*Token wallet ${wallet} has insufficient token balance.*`;
    } else {
      return `*Token wallet ${wallet} has insufficient token allowance*`;
    }
  };

  if (balance < destQty) {
    return `*Dest amount greater than balance.*\nBalance: ${balance}\nDest Qty: ${destQty}`;
  }

  return `*Rate exceeds sanity rates*`;
}

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 2) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 2 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    let srcToken = args[0];
    let reserveAddress = args[1];

    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const convRateABI = JSON.parse(fs.readFileSync('src/contracts/abi/ConversionRatesInterface.abi', 'utf8'));

    srcToken = currencies.find(o => o.symbol === srcToken.toUpperCase());
    if (!srcToken) {
      reply('Invalid source token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    if (srcToken.reserves_src.findIndex(address => (address.toLowerCase() === reserveAddress.toLowerCase())) == -1) {
      reply('Reserve address not found in /currencies API.', inReplyTo(message.message_id));
      return;
    }

    const reserveInstance = new web3.eth.Contract(reserveABI, reserveAddress);
    const pricingInstance = new web3.eth.Contract(
      convRateABI,
      await reserveInstance.methods.conversionRatesContract().call()
    );

    tradeEnabled = await reserveInstance.methods.tradeEnabled().call();
    if (!tradeEnabled) {
      reply('Reserve trade not enabled.', inReplyTo(message.message_id));
      return;
    }

    const BUY_QTY = web3.utils.toWei('0.5');
    const SELL_QTY = 10 * 10 ** srcToken.decimals;

    result = await debugReserve(ETH_ADDRESS,srcToken.address,BUY_QTY,SELL_QTY,reserveInstance,pricingInstance);
    replyWithMarkdown(`${result}`, inReplyTo(message.message_id));
    return;
    }
};
