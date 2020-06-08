const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const currencies = (await kyber.get('/currencies')).data.data;
    const token = args[0].toUpperCase();
    const result = currencies.find(o => o.symbol === token);

    if (!result) {
      reply('Invalid token symbol.', inReplyTo(message.message_id));
      return;
    }

    replyWithMarkdown(`${result.address}`, inReplyTo(message.message_id));
  };
};
