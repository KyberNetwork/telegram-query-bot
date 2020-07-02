const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const kyberNetwork = helpers.getProxyFunction(network, 'kyberNetwork');
    const kyberHintHandler = helpers.getProxyFunction(network, 'kyberHintHandler');
    const enabled = helpers.getProxyFunction(network, 'enabled');
    const maxGasPrice = helpers.getProxyFunction(network, 'maxGasPrice');

    let msg ='';
    msg = msg.concat(
      `kyberNetwork: \`${await kyberNetwork().call()}\`\n`,
      `kyberHintHandler: \`${await kyberHintHandler().call()}\`\n`,
      `enabled: \`${await enabled().call()}\`\n`,
      `maxGasPrice: \`${await maxGasPrice().call()}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
