const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state } = ctx;
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

    let msg ='';
    msg = msg.concat(
      `KyberNetworkProxy: \`${contracts[network].KyberNetworkProxy._address}\`\n`,
      `KyberNetwork: \`${contracts[network].KyberNetwork._address}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
