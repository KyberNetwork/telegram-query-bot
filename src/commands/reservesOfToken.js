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
    let token = args[0].toUpperCase();

    token = currencies.find(o => o.symbol === token);

    if (!token) {
      reply('Invalid token symbol.', inReplyTo(message.message_id));
      return;
    }

    if (token.symbol === 'ETH') {
      replyWithMarkdown('ETH is the native cryptoasset, and therefore no reserves.', inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(token.reserves_src.join(', '), inReplyTo(message.message_id));
    }
  };
};
