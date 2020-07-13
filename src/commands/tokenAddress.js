const Extra = require('telegraf/extra');

module.exports = () => {
  return async (ctx) => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const token = args[0].toUpperCase();
    const result = currencies.find((o) => o.symbol === token);

    if (!result) {
      reply('Invalid token symbol.', inReplyTo(message.message_id));
      return;
    }

    replyWithMarkdown(result.address, inReplyTo(message.message_id));
  };
};
