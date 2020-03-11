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
  '/getExpectedRate <srcToken> <destToken> <srcQty> <optional: network>\n',
  '/feePayedPerReserve <reserve>\n',
  '/getReservesRates <token> <qty>\n',
  '/isFeeSharingWallet <wallet>\n',
  '/isReserveListed <reserve> <optional: network>\n',
  '/latestBlock <optional: network>\n',
  '/liquidityParams <json>\n',
  '/liquidityRate <eth> <pmin>\n',
  '/networkContracts <optional: network>\n',
  '/rates <token> <qty> <optional: network>\n',
  '/reserveBalances <reserve> <optional: network>\n',
  '/reserveContracts <reserve> <optional: network>\n',
  '/reserveFeesInBps <reserve> <optional: network>\n',
  '/reserveIndex <reserve> <optional: network>\n',
  '/reserveKNCWallet <reserve>\n',
  '/reservesOfToken <token>\n',
  '/tokenAddress <token>\n',
  '/tokensOfReserve <reserve>\n',
  '/update\n',
  '/whois <address>',
);
app.help(ctx => {
  ctx.replyWithMarkdown(
    help,
    Extra.inReplyTo(ctx.message.message_id),
  );
});

app.startPolling();
logger.info('- TELEGRAM BOT STARTED -');
