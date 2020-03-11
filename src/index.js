const Extra = require('telegraf/extra');
const logger = require('./logger');
const app = require('./app');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

app.catch(err => {
  logger.error(err);
});

let help = '';
help = help.concat(
  'I can query Kyber data for you.\n\n',
  'You can control me by sending these commands:\n\n',
  '/collectedFeesInTwei <reserve> <optional: network>\n',
  '/convert <qty> <srcToken> <destToken> <optional: network>\n',
  '/debugReserve <token> <reserve>\n',
  '/getConversionRate <reserve> <srcToken> <destToken> <srcQty> <blockNumber> <optional: network>\n',
  '/getexpectedrate <srcToken> <destToken> <srcQty> <optional: network>\n',
  '/getreservefeesinbps <reserve>\n',
  '/update',
);
app.help(ctx => {
  ctx.replyWithMarkdown(
    help,
    Extra.inReplyTo(ctx.message.message_id),
  );
});

app.startPolling();
logger.info('- TELEGRAM BOT STARTED -');
