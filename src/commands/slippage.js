const Extra = require('telegraf/extra');

module.exports = (config) => {
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
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let network = 'mainnet';
    let amount;
    let slippageAmount;

    if (args[1]) {
      if (helpers.networks.includes(args[1].toLowerCase())) {
        network = args[1].toLowerCase();
      } else {
        amount = args[1];
      }
    }

    if (args[2]) {
      if (helpers.networks.includes(args[2].toLowerCase())) {
        network = args[2].toLowerCase();
      } else {
        slippageAmount = args[2];
      }
    }

    network = args[3] ? args[3].toLowerCase() : network;
    const { ethers } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;

    if (amount == undefined) {
      amount = '0';
    }
    if (slippageAmount == undefined) {
      slippageAmount = '0';
    }

    let token = args[0];
    if (!token.startsWith('0x')) {
      token = currencies.find((o) => o.symbol === token.toUpperCase());
    } else if (token.length === 42 && token.startsWith('0x')) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    const getSlippageRateInfo = helpers.getRateFunction(
      network,
      config ? 'getSlippageRateInfoWithConfigReserves' : 'getSlippageRateInfo'
    );

    try {
      const result = await getSlippageRateInfo(
        token.address,
        ethers.utils.parseEther(amount),
        ethers.utils.parseEther(slippageAmount)
      );
      const buyReserves =
        result[config ? 'reserves' : 'buyReserves'];
      const sellReserves =
        result[config ? 'reserves' : 'sellReserves'];

      let msg = '*BUY SLIPPAGE*\n';
      let reserveAscii;
      let reserveType;
      for (let index in buyReserves) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(
          buyReserves[index]
        );

        msg = msg.concat(
          `${index}] ${buyReserves[index].replace(/0+$/, '')}`,
          ` (${reserveAscii.replace(/_/g, '\\_')} [[${reserveType}]]) : `,
          `\`${result.buySlippageRateBps[index]} bps\`\n`
        );
      }
      msg = msg.concat('\n*SELL SLIPPAGE*\n');
      for (let index in sellReserves) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(
          sellReserves[index]
        );

        msg = msg.concat(
          `${index}] ${sellReserves[index].replace(/0+$/, '')}`,
          ` (${reserveAscii.replace(/_/g, '\\_')} [[${reserveType}]]) : `,
          `\`${result.sellSlippageRateBps[index]} bps\`\n`
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
