const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetwork, KyberNetworkStaging } = contracts;
    const { args } = state.command;

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`, inReplyTo(message.message_id));
      return;
    }

    const reserve = args[0].toLowerCase();
    const mainnetReserves = await KyberNetwork.methods.getReserves().call();
    const stagingReserves = await KyberNetworkStaging.methods.getReserves().call();
    const mainnetResult = mainnetReserves.findIndex(r => reserve.toLowerCase() === r.toLowerCase());
    const stagingResult = stagingReserves.findIndex(r => reserve.toLowerCase() === r.toLowerCase());

    if (mainnetResult === -1 && stagingResult === -1) {
      replyWithMarkdown('*Reserve not found.*', inReplyTo(message.message_id));
    } else if (mainnetResult !== -1 && stagingResult !== -1) {
      replyWithMarkdown('*Mainnet and Staging*', inReplyTo(message.message_id));
    } else if (mainnetResult !== -1) {
      replyWithMarkdown('*Mainnet*', inReplyTo(message.message_id));
    } else if (stagingResult !== -1) {
      replyWithMarkdown('*Staging*', inReplyTo(message.message_id));      
    }
  };
};
