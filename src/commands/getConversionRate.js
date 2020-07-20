const Extra = require('telegraf/extra');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (args.length < 4) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 4 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let srcToken = args[1];
    let destToken = args[2];
    let srcQty = args[3];
    let blockNumber;
    let network = 'mainnet';

    if (args[4]) {
      if (
        helpers.networks.includes(
          args[4].toLowerCase()
        )
      ) {
        network = args[4].toLowerCase();
      } else {
        blockNumber = args[4];
      }
    }

    network = args[5] ? args[5].toLowerCase() : network;
    const { ethers, provider } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
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

    if (srcToken.toUpperCase() === 'ETH') {
      srcToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !srcToken.startsWith('0x') &&
      helpers.networks.indexOf(network) !== -1
    ) {
      srcToken = currencies.find((o) => o.symbol === srcToken.toUpperCase());
    } else if (srcToken.length === 42 && srcToken.startsWith('0x')) {
      srcToken = { address: srcToken };
    } else {
      srcToken = undefined;
    }

    if (destToken.toUpperCase() === 'ETH') {
      destToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !destToken.startsWith('0x') &&
      helpers.networks.indexOf(network) !== -1
    ) {
      destToken = currencies.find((o) => o.symbol === destToken.toUpperCase());
    } else if (destToken.length === 42 && destToken.startsWith('0x')) {
      destToken = { address: destToken };
    } else {
      destToken = undefined;
    }

    if (!srcToken || !destToken) {
      reply(
        'Invalid source or destination token symbol or address.',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (
      srcToken.symbol === 'ETH' ||
      srcToken.address.toLowerCase() ===
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      srcQty = ethers.utils.parseEther(srcQty);
    } else {
      const srcTokenInstance = helpers.getTokenInstance(
        network,
        srcToken.address
      );
      const decimals = srcToken.decimals || (await srcTokenInstance.decimals());
      srcQty = Math.round(srcQty * 10 ** decimals).toLocaleString('fullwide', {
        useGrouping: false,
      });
    }

    if (blockNumber == 'latest' || blockNumber == undefined) {
      blockNumber = await provider.getBlockNumber();
    }

    const result = await reserveInstance.getConversionRate(
      srcToken.address,
      destToken.address,
      srcQty,
      blockNumber
    );

    if (!result) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    const rate = Number(ethers.utils.formatEther(result)).toFixed(5);
    replyWithMarkdown(`\`${rate} (${result})\``, inReplyTo(message.message_id));
  };
};
