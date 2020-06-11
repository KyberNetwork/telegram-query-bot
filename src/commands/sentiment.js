const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { feargreedindex } = axios;
    const { inReplyTo } = Extra;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const sentiment = (await feargreedindex.get('/fng')).data.data[0];

    replyWithMarkdown(
      `Fear & Greed Index: *${sentiment.value} (${sentiment.value_classification})*`,
      inReplyTo(message.message_id),
    );
  };
};
