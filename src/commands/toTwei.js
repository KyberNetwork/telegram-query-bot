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

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[2] ? args[2].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const qty = args[0];

    let token = args[1];
    if (
      !token.startsWith('0x') &&
      helpers.networks.indexOf(network) !== -1
    ) {
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

    const tokenInstance = new ethers.Contract(
      token.address,
      tokenABI,
      provider
    );
    const decimals = token.decimals || (await tokenInstance.decimals());
    const result = Math.round(qty * 10 ** decimals).toLocaleString('fullwide', {
      useGrouping: false,
    });

    replyWithMarkdown(result, inReplyTo(message.message_id));
  };
};
