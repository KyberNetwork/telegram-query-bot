const Extra = require('telegraf/extra');

module.exports = () => {
  return async (ctx) => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const { ethers } = helpers.getEthLib(network);
    const getReserves = helpers.getStorageFunction(network, 'getReserves');
    const reserves = await getReserves();

    let reserve = args[0]; // either address or ID
    
    if (!ethers.utils.isAddress(reserve)) {
      const getReserveAddresses = helpers.getStorageFunction(
        network,
        'getReserveAddressesByReserveId'
      );
      const query = await getReserveAddresses(helpers.to32Bytes(reserve));

      reserve = query[0];
    }

    const result = reserves.findIndex(
      (r) => reserve.toLowerCase() === r.toLowerCase()
    );

    if (result !== -1) {
      replyWithMarkdown(helpers.emojis('checkMark'), inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(helpers.emojis('crossMark'), inReplyTo(message.message_id));
    }
  };
};
