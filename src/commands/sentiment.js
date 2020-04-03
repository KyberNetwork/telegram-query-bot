const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, replyWithMarkdown } = ctx;
    const { feargreedindex } = axios;
    const { inReplyTo } = Extra;

    const sentiment = (await feargreedindex.get('/fng')).data.data[0];

    replyWithMarkdown(
      `Fear & Greed Index: *${sentiment.value} (${sentiment.value_classification})*`,
      inReplyTo(message.message_id),
    );
  };
};
