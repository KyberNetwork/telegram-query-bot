const Extra = require('telegraf/extra');
const fs = require('fs');

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
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let network = 'mainnet';
    let amount;

    if (args[1]) {
      if (helpers.networks.includes(args[1].toLowerCase())) {
        network = args[1].toLowerCase();
      } else {
        amount = args[1];
      }
    }

    network = args[2] ? args[2].toLowerCase() : network;
    const { ethers } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;

    if (amount == undefined) {
      amount = '0';
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

    const getSpreadInfo = helpers.getRateFunction(network, 'getSpreadInfo');

    try {
      const result = await getSpreadInfo(
        token.address,
        ethers.utils.parseEther(amount)
      );
      console.log(result);

      let msg = '*SPREADS*\n';
      let reserveAscii;
      let reserveType;
      for (let index in result.reserves) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(
          result.reserves[index]
        );

        msg = msg.concat(
          `${index}] ${result.reserves[index].replace(/0+$/, '')}`,
          ` (${reserveAscii.replace(/_/g, '\\_')} [[${reserveType}]]) : `,
          `\`${result.spreads[index]} bps\`\n`,
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
