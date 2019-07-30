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
    let srcToken = args[0].toUpperCase();
    let destToken = args[1].toUpperCase();
    let srcQty = args[2];

    srcToken = currencies.find(o => o.symbol === srcToken);
    destToken = currencies.find(o => o.symbol === destToken);

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (srcToken.symbol === 'ETH') {
      srcQty = web3.utils.toWei(srcQty);
    } else {
      srcQty = new BN(srcQty).mul(new BN(String(10 ** srcToken.decimals)));
    }

    const result = await KyberNetworkProxy.methods.getExpectedRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
    ).call();

    const expectedRate = web3.utils.fromWei(result.expectedRate.toString());
    const slippageRate = web3.utils.fromWei(result.slippageRate.toString());

    replyWithMarkdown(`*Expected Rate: ${expectedRate}\nSlippage Rate: ${slippageRate}*`, inReplyTo(message.message_id));
  };
};
