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

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;

    let token = args[0];
    if (
      !token.startsWith('0x') &&
      ['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1
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

    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const tokenInstance = new ethers.Contract(
      token.address,
      tokenABI,
      provider
    );

    const symbol = await tokenInstance.symbol();
    const name = await tokenInstance.name();
    const decimals = await tokenInstance.decimals();
    const totalSupply = helpers.toHumanNum(
      (await tokenInstance.totalSupply()) / 10 ** decimals
    );

    let msg = '';
    msg = msg.concat(
      `symbol: \`${symbol}\`\n`,
      `name: \`${name}\`\n`,
      `decimals: \`${decimals}\`\n`,
      `totalSupply: \`${totalSupply}\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
