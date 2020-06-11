const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`
      );
      return;
    }

    const network = args[2] ? args[2].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const currencies = (await kyber.get('/currencies')).data.data;
    const qty = args[0];

    let token = args[1];
    if (
      !token.startsWith('0x') &&
      (network.toLowerCase() == 'mainnet' || network.toLowerCase() == 'staging')
    ) {
      token = currencies.find(o => o.symbol === token.toUpperCase());
    } else if (
      token.length === 42 &&
      token.startsWith('0x')
    ) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    const tokenInstance = new web3.eth.Contract(tokenABI, token.address);
    const decimals =
      token.decimals || (await tokenInstance.methods.decimals().call());
    const result = Math.round(qty * 10 ** decimals).toLocaleString(
      'fullwide',
      { useGrouping: false }
    );

    replyWithMarkdown(result, inReplyTo(message.message_id));
  };
};
