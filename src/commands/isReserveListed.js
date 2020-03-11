const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`, inReplyTo(message.message_id));
      return;
    }

    const reserve = args[0].toLowerCase();
    const reserves = {};
    const networks = ['mainnet', 'staging', 'ropsten', 'rinkeby', 'kovan'];
    let getReserves;
    let result;

    for (let i in networks) {
      getReserves = helpers.getNetworkFunction(networks[i], 'getReserves');
      result = await getReserves().call();
      reserves[networks[i]] = result.findIndex(r => reserve.toLowerCase() === r.toLowerCase());
    }

    let msg = '';
    Object.keys(reserves).forEach(network => {
      if (reserves[network] !== -1) {
        msg = msg.concat(`**${network}**\n`);
      }
    });

    if (msg === '') {
      replyWithMarkdown('*Reserve not found on any network.*', inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(msg, inReplyTo(message.message_id));
    }
  };
};
