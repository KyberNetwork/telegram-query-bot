const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetwork, KyberNetworkStaging } = contracts;
    const { args } = state.command;

    if (args.length < 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`, inReplyTo(message.message_id));
      return;
    }

    const reserve = args[0].toLowerCase();

    let reserves;
    if (args[1] && args[1].toLowerCase() === 'staging') {
      reserves = await KyberNetworkStaging.methods.getReserves().call();
    } else {
      reserves = await KyberNetwork.methods.getReserves().call();
    }

    const result = reserves.findIndex(r => reserve.toLowerCase() === r.toLowerCase());

    if (result === -1) {
      reply('Reserve not found.', inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
    }
  };
};
