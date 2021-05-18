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

    if (args.length !== 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const diff = args[0];

    replyWithMarkdown(`AMP: \`${1/(1-(Math.sqrt(1 - (diff/100))))}\``, inReplyTo(message.message_id));
  };
};
