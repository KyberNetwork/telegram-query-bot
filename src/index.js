const Extra = require('telegraf/extra');
const logger = require('./logger');
const app = require('./app');

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise ', p, reason);
  // console.log(p);
  // console.log(reason);
});

app.catch(err => {
  logger.error(err);
});

const networkCmds = [
  'convert',
  'dRates',
  'eRates',
  'getExpectedRate',
  'getExpectedRateAfterFee',
  'getReservesRates',
  'maxGasPrice',
  'networkContracts',
  'networkInfo',
  'optimiseTrade',
  'rates',
  'ratesWithConfig',
  'tRates',
  'slippage',
  'slippageWithConfig',
  'spread',
  'spreadWithConfig',
];
const hinthandlerCmds = [
  'buildHint',
  'parseHint',
];
const stakingCmds = [
  'latestStakerData',
  'stakerData',
  'stakerRawData',
  'stakingAPY',
  'totalStaked',
];
const daoCmds = [
  'brr',
  'daoCampaignIDs',
  'daoInfo',
  'daoLatestStakerPercentage',
  'daoShouldBurnReward',
  'daoStakerRewardPercentage',
  'daoTotalEpochPoints',
  'daoCampaignDetails',
  'daoCampaignVoteCount',
  'daoCampaignWinData',
];
const storageCmds = [
  'newReserveId',
  'reserveInfo',
  'reserveIdToAscii',
  'reserves',
  'reservesPerToken',
  'tokensPerReserve',
];
const feehandlerCmds = [
  'burnInfo',
  'feeLatestSanityRate',
  'feeSanityRates',
  'prrFees',
  'rewards',
];
const dmmCmds = [
  'dmmAmpFromDiff',
  'dmmRangeFromAmp',
];
const reservesCmds = [
  'checkAPRRate',
  'collectedFeesInTwei',
  'debugReserve',
  'getConversionRate',
  'isReserveListed',
  'liquidityParams',
  'liquidityRate',
  'lp',
  'reserveBalances',
  'reserveContracts',
  'reserveIndex',
  'reserveRebates',
  'tokensOfReserve',
];
const miscCmds = [
  'fromTwei',
  'fromWei',
  'gas',
  'latestBlock',
  'permissions',
  'sentiment',
  'tokenAddress',
  'tokenInfo',
  'toTwei',
  'toWei',
];

let help = '';
help = help.concat(
  'I can query Kyber data for you.\n',
  'For more help details of a particular category, do:\n\n',
  '/h [[network|hinthandler|staking|dao|storage|feehandler|dmm|reserves|misc]]\n\n',
  'Brief list of commands:\n\n',
  '**NETWORK**\n',
  '=========\n',
  `\`${networkCmds.join('`, `')}\`\n\n`,
  '**HINT HANDLER**\n',
  '=============\n',
  `\`${hinthandlerCmds.join('`, `')}\`\n\n`,
  '**STAKING**\n',
  '=======\n',
  `\`${stakingCmds.join('`, `')}\`\n\n`,
  '**DAO**\n',
  '====\n',
  `\`${daoCmds.join('`, `')}\`\n\n`,
  '**STORAGE**\n',
  '========\n',
  `\`${storageCmds.join('`, `')}\`\n\n`,
  '**FEE HANDLER**\n',
  '============\n',
  `\`${feehandlerCmds.join('`, `')}\`\n\n`,
  '**DMM**\n',
  '============\n',
  `\`${dmmCmds.join('`, `')}\`\n\n`,
  '**RESERVES**\n',
  '============\n',
  `\`${reservesCmds.join('`, `')}\`\n\n`,
  '**MISC**\n',
  '============\n',
  `\`${miscCmds.join('`, `')}\``,
);

app.help(ctx => {
  ctx.replyWithMarkdown(
    help,
    Extra.inReplyTo(ctx.message.message_id),
  );
});

app.startPolling();
logger.info('- TELEGRAM BOT STARTED -');
