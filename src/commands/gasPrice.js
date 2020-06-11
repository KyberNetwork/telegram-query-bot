const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { ethgasstation } = axios;
    const { inReplyTo } = Extra;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const gasPrice = (await ethgasstation.get('json/ethgasAPI.json')).data;

    let result = '';
    result = result.concat(
      `fastest: \`${gasPrice.fastest / 10}\`\n`,
      `fast: \`${gasPrice.fast / 10}\`\n`,
      `average: \`${gasPrice.average / 10}\`\n`,
      `slow: \`${gasPrice.safeLow / 10}\``,
    );

    replyWithMarkdown(result, inReplyTo(message.message_id));
  };
};
