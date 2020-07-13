const Extra = require('telegraf/extra');

module.exports = () => {
  return async (ctx) => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[0] ? args[0].toLowerCase() : 'mainnet';
    const { ethers } = helpers.getEthLib(network);
    const getLatestSanityRate = helpers.getFeeHandlerFunction(
      network,
      'getLatestSanityRate'
    );
    const result = ethers.utils.formatEther(await getLatestSanityRate());

    replyWithMarkdown(
      `Sanity Rate from Fee Handler: \`${result}\``,
      inReplyTo(message.message_id)
    );
  };
};
