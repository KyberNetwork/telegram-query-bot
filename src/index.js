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
  '`Checks if the rates returned follows the liquidity params configured`\n',
  '/checkAPRRate <reserve> <optional: network>\n\n',
  '`Returns the collected fees of an APR`\n',
  '/collectedFeesInTwei <reserve> <optional: network>\n\n',
  '`Returns the convertion of the source token to the destination token given a quantity`\n',
  '/convert <qty> <srcToken> <destToken> <optional: network>\n\n',
  '`Returns the reserve rates of a particular token in USD`\n',
  '/dRates <token> <qty> <optional: network>\n\n',
  '`Returns the reserve rates of a particular token in ETH`\n',
  '/eRates <token> <qty> <optional: network>\n\n',
  '`Returns the burned fees and sent wallet fees for a reserve`\n',
  '/feePayedPerReserve <reserve>\n\n',
  '`Converts the input from token wei to human readable format`\n',
  '/fromTwei <qty> <token> <optional: network>\n\n',
  '`Converts the input from wei to human readable format`\n',
  '/fromWei <qty>\n\n',
  '`Returns the current gas price of the network, taken from ETHGasStation`\n',
  '/gas\n\n',
  '`Returns the conversion rate from the reserve contract`\n',
  '/getConversionRate <reserve> <srcToken> <destToken> <srcQty> <blockNumber> <optional: network>\n\n',
  '`Returns the expected and slippage rate from the proxy contract`\n',
  '/getExpectedRate <srcToken> <destToken> <srcQty> <optional: network>\n\n',
  '`Returns the reserve rates of a particular token`\n',
  '/getReservesRates <token> <qty>\n\n',
  '`Checks if the input is part of the fee sharing program`\n',
  '/isFeeSharingWallet <wallet>\n\n',
  '`Checks if the reserve is listed in any network`\n',
  '/isReserveListed <reserve> <optional: network>\n\n',
  '`Returns the latest block number of a network`\n',
  '/latestBlock <optional: network>\n\n',
  '`Computes and returns the liquidity params based on the JSON input`\n',
  '/liquidityParams <json>\n\n',
  '`Computes and returns the liquidity rate based on the ETH and pMin input`\n',
  '/liquidityRate <eth> <pmin>\n\n',
  '`Returns the Kyber contract addresses for a network`\n',
  '/networkContracts <optional: network>\n\n',
  '`Alias for /getReservesRates`\n',
  '/rates <token> <qty> <optional: network>\n\n',
  '`Returns all the token balances of a reserve`\n',
  '/reserveBalances <reserve> <optional: network>\n\n',
  '`Returns the network, conversionRates, and sanityRates contract addresses of a reserve`\n',
  '/reserveContracts <reserve> <optional: network>\n\n',
  '`Returns the fees set of a reserve in the FeeBurner`\n',
  '/reserveFeesInBps <reserve> <optional: network>\n\n',
  '`Returns the index of the reserve in the network`\n',
  '/reserveIndex <reserve> <optional: network>\n\n',
  '`Returns the registered KNC wallet address of a reserve in the FeeBurner`\n',
  '/reserveKNCWallet <reserve>\n\n',
  '`Returns the reserves that is support the token specified`\n',
  '/reservesOfToken <token>\n\n',
  '`Display the market sentiment, taken from https://alternative.me/crypto/fear-and-greed-index`\n',
  '/sentiment\n\n',
  '`Returns the address of a token`\n',
  '/tokenAddress <token>\n\n',
  '`Returns the symbol, name, decimals, and totalSupply info of a token`\n',
  '/tokenInfo <token> <optional: network>\n\n',
  '`Returns the tokens supported by a reserve`\n',
  '/tokensOfReserve <reserve>\n\n',
  '`Returns the reserve rates of a particular token using the token as the quote`\n',
  '/tRates <token> <qty> <optional: network>\n\n',
  '`Converts the human readable format input to token wei`\n',
  '/toTwei <qty> <token> <optional: network>\n\n',
  '`Converts the human readable format input to wei`\n',
  '/toWei <qty>\n\n',
  '`Pulls the latest code from the GitHub repo`\n',
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
