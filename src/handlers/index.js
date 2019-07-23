const Extra = require('telegraf/extra');
const logger = require('../logger');
const keywordProcs = require('./keywordProcs');

module.exports = app => {
  for (let index in keywordProcs) {
    app.hears(keywordProcs[index].pattern, ctx => {
      ctx.reply(keywordProcs[index].message, Extra.inReplyTo(ctx.message.message_id));
    });
  }

  app.hears(/moon/gi, ctx => {
    ctx.replyWithSticker('CAADBQADKAADeHzHAAFeanEmvIfLOwI');
  });

  logger.info('Initialized handlers');
};
