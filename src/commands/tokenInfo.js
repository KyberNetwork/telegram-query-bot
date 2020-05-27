const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`
      );
      return;
    }

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const currencies = (await kyber.get('/currencies')).data.data;

    let token = args[0];
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

    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const tokenInstance = new web3.eth.Contract(tokenABI, token.address);

    const symbol = await tokenInstance.methods.symbol().call();
    const name = await tokenInstance.methods.name().call();
    const decimals = await tokenInstance.methods.decimals().call();
    const totalSupply = await tokenInstance.methods.totalSupply().call() / (10 ** decimals);

    let msg ='';
    msg = msg.concat(
      `symbol: \`${symbol}\`\n`,
      `name: \`${name}\`\n`,
      `decimals: \`${decimals}\`\n`,
      `totalSupply: \`${totalSupply.toLocaleString(undefined, { maximumFractionDigits: 16 })}\``,
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
