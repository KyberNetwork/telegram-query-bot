const BN = require('bn.js');
const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, contracts, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetworkProxy } = contracts;
    const { args } = state.command;

    if (args.length !== 3) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 3 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    let qty = args[0];
    let srcToken = args[1].toUpperCase();
    let destToken = args[2].toUpperCase();
    let srcQty;
    let result;

    srcToken = currencies.find(o => o.symbol === srcToken);
    destToken = currencies.find(o => o.symbol === destToken);

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (srcToken.symbol === 'ETH') {
      srcQty = web3.utils.toWei(qty);
    } else {
      srcQty = new BN(qty).mul(new BN(String(10 ** srcToken.decimals)));
    }

    result = await KyberNetworkProxy.methods.getExpectedRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
    ).call();

    if (result.expectedRate === '0') {
      reply('Conversion for the pair is unavailable.');
      return;
    }

    result = web3.utils.fromWei(result.expectedRate.toString()) * qty;

    replyWithMarkdown(`*${qty} ${srcToken.symbol} => ${result} ${destToken.symbol}*`, inReplyTo(message.message_id));
  };
};
