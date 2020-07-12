const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot', inReplyTo(message.message_id),
        inReplyTo(message.message_id),
      );
      return;
    }

    if (args.length < 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const {ethers: ethers, provider: provider} = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const reserve = args[0];
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new ethers.Contract(reserve, reserveABI, provider);
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const tokens = [];
    let result = [];

    currencies.find(o => {
      if (o.reserves_src) {
        o.reserves_src.find(a => {
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

    if (tokens.length === 0) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    result.push(`ETH: \`${helpers.getReadableWei(await provider.getBalance(reserve))}\``);

    for (let index in tokens) {
      let tokenInstance = new ethers.Contract(tokens[index].address, tokenABI, provider);
      let tokenWallet;
      let tokenBalance;

      try {
        tokenWallet = await reserveInstance.tokenWallet(tokens[index].address);
        tokenBalance = (await tokenInstance.balanceOf(tokenWallet)) / (10 ** tokens[index].decimals);
      } catch (e) {
        tokenBalance = (await tokenInstance.balanceOf(reserve)) / (10 ** tokens[index].decimals);
      }

      result.push(`${tokens[index].symbol}: \`${helpers.getReadableNumber(tokenBalance)}\``);
    }

    replyWithMarkdown(result.sort().join('\n'), inReplyTo(message.message_id));
  };
};
