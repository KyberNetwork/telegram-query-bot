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
    const getLatestBRRData = helpers.getDaoFunction(network, 'getLatestBRRData');
    const result = await getLatestBRRData();
    
    let msg = '';
    msg = msg.concat(
      `Burn: \`${result.burnInBps}\`\n`,
      `Rewards: \`${result.rewardInBps}\`\n`,
      `Rebates: \`${result.rebateInBps}\`\n`,
      `Epoch: \`${result.epoch}\`\n`,
      `Expiry: \`${helpers.formatTime(result.expiryTimestamp)}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
