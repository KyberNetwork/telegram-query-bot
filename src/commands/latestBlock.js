const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const blockNumber = (await web3.eth.getBlock('latest')).number;

    replyWithMarkdown(`*${blockNumber}*`, inReplyTo(message.message_id));
  };
};
