const Extra = require('telegraf/extra');

function formatMessage(result, helpers) {
  let finalMsg = [];
  let isFeeAccounted = result.isFeeAccounted ?
    helpers.emojis('checkMark') :
    helpers.emojis('crossMark');
  let isEntitledRebate = result.isEntitledRebate ?
    helpers.emojis('checkMark') :
    helpers.emojis('crossMark');

  finalMsg.push(`name: ${helpers.reserveIdToAscii(result.reserveId)}`);
  finalMsg.push(`type: ${helpers.reserveTypes(result.resType)}`);
  finalMsg.push(`address: ${result.address}`);
  finalMsg.push(`historicalAddresses: ${result.addresses}`)
  finalMsg.push(`reserveId: ${result.reserveId}`);
  finalMsg.push(`feeAccounted: ${isFeeAccounted}`);
  finalMsg.push(`entitledRebate: ${isEntitledRebate}`);
  finalMsg.push(`rebateWallet: ${result.rebateWallet}`);
  finalMsg.push(`rebateAmt: ${result.rebateAmount} ETH`);
  return finalMsg;
}

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
    let getReserveInfo;
    let result = {};
    let query;

    if (ethers.utils.isAddress(reserve)) {
      getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsByAddress'
      );
      query = await getReserveInfo(reserve);
      result.address = reserve;
      result.reserveId = query.reserveId;
    } else {
      reserve = helpers.appendZeroesToReserveId(reserve);
      getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsById'
      );
      query = await getReserveInfo(reserve);
      result.reserveId = reserve;
      result.address = query.reserveAddress;
    }
    
    result.rebateWallet = query.rebateWallet;
    result.resType = query.resType;
    result.isFeeAccounted = query.isFeeAccountedFlag;
    result.isEntitledRebate =  query.isEntitledRebateFlag;

    const getReserveAddresses = helpers.getStorageFunction(
      network,
      'getReserveAddressesByReserveId'
    );

    query = await getReserveAddresses(result.reserveId);
    result.addresses = query;

    const getRebateAmount = helpers.getFeeHandlerFunction(
      network,
      'rebatePerWallet'
    );

    query = await getRebateAmount(result.rebateWallet);
    result.rebateAmount = helpers.toHumanWei(query);

    replyWithMarkdown(
      (formatMessage(result, helpers)).join('\n'),
      inReplyTo(message.message_id)
    );
  };
};
