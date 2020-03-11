const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { contracts, message, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';

    let msg ='';
    msg = msg.concat(
      `KyberNetworkProxy: \`${contracts[network].KyberNetworkProxy._address}\`\n`,
      `KyberNetwork: \`${contracts[network].KyberNetwork._address}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
