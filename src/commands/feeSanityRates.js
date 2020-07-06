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
    const getSanityRateContracts = helpers.getFeeHandlerFunction(network, 'getSanityRateContracts');
    const result = await getSanityRateContracts().call();
    
    replyWithMarkdown((result.length > 0) ? `\`${result.join('`, `')}\`` : 'None', inReplyTo(message.message_id));
  };
};
