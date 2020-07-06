const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const { KyberFeeHandler } = contracts[network];
    const result = web3.utils.fromWei(await web3.eth.getBalance(KyberFeeHandler._address));
    
    replyWithMarkdown(`Current collected fees: \`${result} ETH\``, inReplyTo(message.message_id));
  };
};
