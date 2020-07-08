const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length !== 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const currencies = (await kyber.get('/currencies')).data.data;
    const reserve = args[0].toLowerCase();
    const reservesSrc = [];
    const reservesDest = [];

    currencies.find(o => {
      if (o.reserves_src) {
        o.reserves_src.find(a => {
          if (a.toLowerCase() === reserve) {
            reservesSrc.push(o.symbol);
          }
        });
      }
    });

    currencies.find(o => {
      if (o.reserves_dest) {
        o.reserves_dest.find(a => {
          if (a.toLowerCase() === reserve) {
            reservesDest.push(o.symbol);
          }
        });
      }
    });

    if (reservesSrc.length === 0 && reservesDest.length === 0) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
    }
    
    let result = reservesSrc.concat(reservesDest);
    result = result.filter((element, index) => result.indexOf(element) === index);

    replyWithMarkdown(`Tokens: \`${result.sort().join('`, `')}\``, inReplyTo(message.message_id));
  };
};
