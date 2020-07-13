const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot', inReplyTo(message.message_id),
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const kyberNetwork = helpers.getProxyFunction(network, 'kyberNetwork');
    const kyberHintHandler = helpers.getProxyFunction(network, 'kyberHintHandler');
    const getContracts = helpers.getNetworkFunction(network, 'getContracts');
    const staking = helpers.getDaoFunction(network, 'staking');
    const result = await getContracts();

    let msg ='';
    msg = msg.concat(
      `KyberNetworkProxies: \`${result[5].join('`, `')}\`\n`,
      `kyberNetwork: \`${await kyberNetwork()}\`\n`,
      `kyberHintHandler: \`${await kyberHintHandler()}\`\n`,
      `KyberFeeHandler: \`${result[0]}\`\n`,
      `KyberStaking: \`${await staking()}\`\n`,
      `KyberDao: \`${result[1]}\`\n`,
      `KyberMatchingEngine: \`${result[2]}\`\n`,
      `KyberStorage: \`${result[3]}\`\n`,
      `GasHelper: \`${result[4]}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
