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
    let getReserveInfo;
    let reserve = args[0]; // either address or ID
    let result = {};
    let query;

    if (ethers.utils.isAddress(reserve)) {
      getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsByAddress'
      );
      query = await getReserveInfo(reserve);
      result.reserveId = query.reserveId;
      result.address = reserve;
    } else {
      reserve = helpers.to32Bytes(reserve);
      getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsById'
      );
      query = await getReserveInfo(reserve);
      result.reserveId = reserve;
      result.address = query.reserveAddress;
    }

    const reserveInstance = helpers.getReserveInstance(network, result.address);

    result.rebateWallet = query.rebateWallet;
    result.resType = query.resType;
    result.isFeeAccounted = query.isFeeAccountedFlag
      ? helpers.emojis('checkMark')
      : helpers.emojis('crossMark');
    result.isEntitledRebate = query.isEntitledRebateFlag
      ? helpers.emojis('checkMark')
      : helpers.emojis('crossMark');

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

    result.enabled = (await reserveInstance.tradeEnabled())
      ? helpers.emojis('checkMark')
      : helpers.emojis('crossMark');

    let msg = '';
    msg = msg.concat(
      `ID: \`${result.reserveId.replace(/0+$/, '')}\`\n`,
      `Address: \`${result.address}\`\n`,
      `Name: \`${helpers.reserveIdToAscii(result.reserveId).join(' ')}\`\n`,
      `Type: \`${helpers.reserveTypes(result.resType)}\`\n`,
      `Fee Accounted: ${result.isFeeAccounted}\n`,
      `Entitled Rebate: ${result.isEntitledRebate}\n`,
      `Rebate Wallet: \`${result.rebateWallet}\`\n`,
      `Rebate Amount: \`${result.rebateAmount} ETH\`\n`,
      `Trade Enabled: \`${result.enabled}\`\n`,
      `Historical Addresses: \`${result.addresses.join('`, `')}\``,
    );

    replyWithMarkdown(
      msg,
      inReplyTo(message.message_id)
    );
  };
};
