const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const {ethers: ethers} = helpers.getEthLib(network);
    const totalPayoutBalance = helpers.getFeeHandlerFunction(network, 'totalPayoutBalance');

    const result = Number(ethers.utils.formatEther(await totalPayoutBalance())).toFixed(5);
    
    replyWithMarkdown(`PRR fees: \`${result} ETH\``, inReplyTo(message.message_id));
  };
};
