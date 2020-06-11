const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { FeeBurner } = contracts.mainnet;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const reserve = args[0].toLowerCase();
    const result = await FeeBurner.methods.reserveKNCWallet(reserve).call();

    if (result === '0x0000000000000000000000000000000000000000') {
      replyWithMarkdown('KNC Fee Wallet not registered for reserve.');
    } else {
      replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
    }
  };
};
