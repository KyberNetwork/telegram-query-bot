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
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const p0 = args[0];
    const amp = args[1];
    const diff = Math.pow((amp - 1) / amp, 2);

    let msg = '';
    msg = msg.concat(
      `Min Price: \`${(diff * p0).toFixed(18)}\`\n`,
      `Max Price: \`${(p0 / diff).toFixed(18)}\`\n`,
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
