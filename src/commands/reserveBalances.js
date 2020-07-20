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

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of 1 provided.`
      );
      return;
    }

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    let reserve = args[0]; // either address or ID
    let result = [];
    let tokens = [];

    if (!ethers.utils.isAddress(reserve)) {
      const getReserveAddresses = helpers.getStorageFunction(
        network,
        'getReserveAddressesByReserveId'
      );
      const query = await getReserveAddresses(helpers.to32Bytes(reserve));

      reserve = query[0];
    }

    currencies.find((o) => {
      if (o.reserves_src) {
        o.reserves_src.find((a) => {
          if (a.toLowerCase() === reserve.toLowerCase()) {
            tokens.push({
              symbol: o.symbol,
              address: o.address,
              decimals: o.decimals,
            });
          }
        });
      }
      if (o.reserves_dest) {
        o.reserves_dest.find((a) => {
          if (a.toLowerCase() === reserve.toLowerCase()) {
            tokens.push({
              symbol: o.symbol,
              address: o.address,
              decimals: o.decimals,
            });
          }
        });
      }
    });

    tokens = tokens.filter(
      (v, i, a) => a.findIndex((t) => t.symbol === v.symbol) === i
    );

    if (tokens.length === 0) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    result.push(
      `ETH: \`${helpers.toHumanWei(await provider.getBalance(reserve))}\``
    );

    const reserveInstance = helpers.getReserveInstance(network, reserve);
    let tokenInstance;
    let tokenWallet;
    let tokenBalance;
    for (let index in tokens) {
      tokenInstance = helpers.getTokenInstance(network, tokens[index].address);

      try {
        tokenWallet = await reserveInstance.tokenWallet(tokens[index].address);
        tokenBalance =
          (await tokenInstance.balanceOf(tokenWallet)) /
          10 ** tokens[index].decimals;
      } catch (e) {
        tokenBalance =
          (await tokenInstance.balanceOf(reserve)) /
          10 ** tokens[index].decimals;
      }

      result.push(
        `${tokens[index].symbol}: \`${helpers.toHumanNum(tokenBalance)}\``
      );
    }

    replyWithMarkdown(result.sort().join('\n'), inReplyTo(message.message_id));
  };
};
