const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { FeeBurner } = contracts.mainnet;
    const { args } = state.command;

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const reserve = args[0];
    const result = await FeeBurner.methods.reserveFeesInBps(reserve).call();

    if (result.toString() === '0') {
      replyWithMarkdown('Reserve not registered to FeeBurner.', inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
    }
  };
};
