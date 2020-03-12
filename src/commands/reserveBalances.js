const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const currencies = (await axios.get('/currencies')).data.data;
    const reserve = args[0];
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const tokens = [];
    let result = [];

    currencies.find(o => {
      if (o.reserves_src) {
        o.reserves_src.find(a => {
          if (a.toLowerCase() === reserve) {
            tokens.push({
              symbol: o.symbol,
              address: o.address,
              decimals: o.decimals,
            });
          }
        });
      }
    });

    if (tokens.length === 0) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    result.push(`ETH: ${web3.utils.fromWei(await web3.eth.getBalance(reserve))}`);

    for (let index in tokens) {
      let tokenInstance = new web3.eth.Contract(tokenABI, tokens[index].address);
      let tokenWallet;
      let tokenBalance;

      try {
        tokenWallet = await reserveInstance.methods.tokenWallet(tokens[index].address).call();
        tokenBalance = (await tokenInstance.methods.balanceOf(tokenWallet).call()) / (10 ** tokens[index].decimals);
      } catch (e) {
        tokenBalance = (await tokenInstance.methods.balanceOf(reserve).call()) / (10 ** tokens[index].decimals);
      }

      result.push(`${tokens[index].symbol}: ${tokenBalance}`);
    }

    replyWithMarkdown(result.sort().join('\n'), inReplyTo(message.message_id));
  };
};
