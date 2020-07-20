const Extra = require('telegraf/extra');
const fs = require('fs');

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
    let reserve = args[0]; // either address or ID

    if (!ethers.utils.isAddress(reserve)) {
      const getReserveAddresses = helpers.getStorageFunction(
        network,
        'getReserveAddressesByReserveId'
      );
      const query = await getReserveAddresses(helpers.to32Bytes(reserve));

      reserve = query[0];
    }
    
    const reserveInstance = helpers.getReserveInstance(network, reserve);
    const kyberNetwork = await reserveInstance.kyberNetwork();
    const conversionRates = await reserveInstance.conversionRatesContract();
    const sanityRates = await reserveInstance.sanityRatesContract();

    let msg = '';
    msg = msg.concat(
      `kyberNetwork: \`${kyberNetwork}\`\n`,
      `conversionRatesContract: \`${conversionRates}\`\n`,
      `sanityRatesContract: \`${sanityRates}\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
