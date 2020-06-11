const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length !== 2) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 2 provided.`);
      return;
    }

    const ether = args[0];
    const pMin = args[1];

    replyWithMarkdown(`Liquidity Rate: *${Math.log(1 / pMin) / ether}*`, inReplyTo(message.message_id));
  };
};
