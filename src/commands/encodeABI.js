const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetworkStaging } = contracts;
    const { args } = state.command;
    let result;

    if (args.length === 1) {
      reply('ERROR: No function provided.');
      return;
    }

    switch (args[0].toLowerCase()) {
    case 'addreserve':
      if (args.length-1 !== 2) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 2 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.addReserve(args[1], args[2]).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    case 'listpairforreserve':
      if (args.length-1 !== 5) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 5 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.listPairForReserve(
          args[1],
          args[2],
          args[3],
          args[4],
          args[5],
        ).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    case 'removereserve':
      if (args.length-1 !== 2) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 2 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.removeReserve(args[1], args[2]).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    default:
      reply('ERROR: Function not found in repertoire.');
      return;
    }

    replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
  };
};
