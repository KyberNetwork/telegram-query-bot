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
    let rebateId = args[0]; // either reserve address, reserve ID or rebateWallet
    let result;

    // reserve ID was parsed
    if (!ethers.utils.isAddress(rebateId)) {
      const getReserveDetailsById = helpers.getStorageFunction(
        network,
        'getReserveDetailsById'
      );
      result = await getReserveDetailsById(rebateId);
      rebateId = result.rebateWallet;
    } else {
      const getReserveDetailsByAddress = helpers.getStorageFunction(
        network,
        'getReserveDetailsByAddress'
      );
      result = await getReserveDetailsByAddress(rebateId);
      if (result.rebateWallet != ethers.constants.AddressZero) {
        rebateId = result.rebateWallet;
      }
    }

    const getRebateAmount = helpers.getFeeHandlerFunction(
      network,
      'rebatePerWallet'
    );
    result = await getRebateAmount(rebateId);

    replyWithMarkdown(
      `Rebate Amt: \`${helpers.toHumanWei(result)} ETH\``,
      inReplyTo(message.message_id)
    );
  };
};
