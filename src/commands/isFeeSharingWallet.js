const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { WrapFeeBurner } = contracts.mainnet;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const wallet = args[0].toLowerCase();
    const wallets = await WrapFeeBurner.methods.getFeeSharingWallets().call();
    const result = wallets.findIndex(r => wallet.toLowerCase() === r.toLowerCase());

    replyWithMarkdown(`*${result > -1}*`, inReplyTo(message.message_id));
  };
};
