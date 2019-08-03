const Extra = require('telegraf/extra');
const logger = require('./logger');
const app = require('./app');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

app.catch(err => {
  logger.error(err);
});

app.help(ctx => {
  ctx.reply(
    `I can query Kyber data for you.

You can control me by sending these commands:

/convert <qty> <srcToken_symbol> <destToken_symbol>
/encodeABI <function> <...args>
/getAddressOfToken <token_symbol>
/getAPRCollectedFees <reserve_address>
/getConversionRate <reserve_address> <srcToken_symbol> <destToken_symbol> <srcQty> <blockNumber>
/getExpectedRate <srcToken_symbol> <destToken_symbol> <srcQty> <optional: network>
/getKNCFeeWallet <reserve_address>
/getLiquidityParams <json_input>
/getReserveBalances <reserve_address>
/getReserveFeesInBPS <reserve_address>
/getReserveIndex <reserve_address> <optional: network>
/getReservePaidFees <reserve_address>
/getReservesOfToken <token_symbol>
/getTokensOfReserve <reserve_address>
/isFeeSharingWallet <wallet_address>
/isReserveListed <reserve_address>
/update`,

    Extra.inReplyTo(ctx.message.message_id),
  );
});

app.startPolling();
logger.info('- TELEGRAM BOT STARTED -');
