const BN = require('bn.js');
const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 5) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 5 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    let reserve = args[0];
    let srcToken = args[1].toUpperCase();
    let destToken = args[2].toUpperCase();
    let srcQty = args[3];
    let blockNumber = args[4];

    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);

    srcToken = currencies.find(o => o.symbol === srcToken);
    destToken = currencies.find(o => o.symbol === destToken);

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (srcToken.symbol === 'ETH') {
      srcQty = web3.utils.toWei(srcQty);
    } else {
      srcQty = Math.round(srcQty * (10 ** srcToken.decimals)).toString();
    }

    if (blockNumber == 'latest') {
      blockNumber = (await web3.eth.getBlock('latest')).number;
    }

    const result = await reserveInstance.methods.getConversionRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
      blockNumber.toString(),
    ).call();

    if (!result) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    replyWithMarkdown(`*${web3.utils.fromWei(result.toString())}*`, inReplyTo(message.message_id));
  };
};
