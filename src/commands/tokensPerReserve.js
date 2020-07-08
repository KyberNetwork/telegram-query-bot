const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const currencies = (await kyber.get('/currencies')).data.data;
    let reserveId = args[0];

    const getListedTokensByReserveId = helpers.getStorageFunction(network, 'getListedTokensByReserveId');
    const { srcTokens, destTokens } = await getListedTokensByReserveId(reserveId).call();

    const resSrcTokens = [];
    const resDestTokens = [];

    for (const token of srcTokens) {
      let t = currencies.find(o => o.address.toLowerCase() === token.toLowerCase());
      if (!t) {
        resSrcTokens.push(token);
      } else {
        resSrcTokens.push(t.symbol);
      }
    }

    for (const token of destTokens) {
      let t = currencies.find(o => o.address.toLowerCase() === token.toLowerCase());
      if (!t) {
        resDestTokens.push(token);
      } else {
        resDestTokens.push(t.symbol);
      }
    }

    let result = resSrcTokens.concat(resDestTokens);
    result = result.filter((element, index) => result.indexOf(element) === index);

    replyWithMarkdown(
      `Tokens: \`${result.sort().join('`, `')}\``,
      inReplyTo(message.message_id),
    );
  };
};
