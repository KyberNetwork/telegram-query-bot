const logger = require('../logger');
const brr = require('./brr');
const buildHint = require('./buildHint');
const burnInfo = require('./burnInfo');
const checkAPRRate = require('./checkAPRRate');
const collectedFeesInTwei = require('./collectedFeesInTwei');
const convert = require('./convert');
const daoCampaignDetails = require('./daoCampaignDetails');
const daoCampaignIds = require('./daoCampaignIds');
const daoCampaignVoteCount = require('./daoCampaignVoteCount');
const daoInfo = require('./daoInfo');
const daoLatestStakerPercentage = require('./daoLatestStakerPercentage');
const daoShouldBurnReward = require('./daoShouldBurnReward');
const daoStakerRewardPercentage = require('./daoStakerRewardPercentage');
const daoTotalEpochPoints = require('./daoTotalEpochPoints');
const daoCampaignWinData = require('./daoCampaignWinData');
const debugReserve = require('./debugReserve');
const dmmAmpFromDiff = require('./dmmAmpFromDiff');
const dmmRangeFromAmp = require('./dmmRangeFromAmp');
const feeLatestSanityRate = require('./feeLatestSanityRate');
const feeSanityRates = require('./feeSanityRates');
const fromTwei = require('./fromTwei');
const fromWei = require('./fromWei');
const gasPrice = require('./gasPrice');
const getConversionRate = require('./getConversionRate');
const getExpectedRate = require('./getExpectedRate');
const getExpectedRateAfterFee = require('./getExpectedRateAfterFee');
const getReservesRates = require('./getReservesRates');
const h = require('./h');
const isReserveListed = require('./isReserveListed');
const latestBlock = require('./latestBlock');
const latestStakerData = require('./latestStakerData');
const liquidityParams = require('./liquidityParams');
const liquidityRate = require('./liquidityRate');
const lp = require('./lp');
const maxGasPrice = require('./maxGasPrice');
const networkContracts = require('./networkContracts');
const networkInfo = require('./networkInfo');
const newReserveId = require('./newReserveId');
const optimiseTrade = require('./optimiseTrade');
const parseHint = require('./parseHint');
const permissions = require('./permissions');
const prrFees = require('./prrFees');
const reserveBalances = require('./reserveBalances');
const reserveContracts = require('./reserveContracts');
const reserveInfo = require('./reserveInfo');
const reserveIdToAscii = require('./reserveIdToAscii');
const reserveIndex = require('./reserveIndex');
const reserveRebates = require('./reserveRebates');
const reserves = require('./reserves');
const reservesPerToken = require('./reservesPerToken');
const rewards = require('./rewards');
const sentiment = require('./sentiment');
const slippage = require('./slippage');
const spread = require('./spread');
const stakerData = require('./stakerData');
const stakerRawData = require('./stakerRawData');
const stakingAPY = require('./stakingAPY');
const tokenAddress = require('./tokenAddress');
const tokenInfo = require('./tokenInfo');
const tokensPerReserve = require('./tokensPerReserve');
const totalStaked = require('./totalStaked');
const toTwei = require('./toTwei');
const toWei = require('./toWei');
const update = require('./update');

module.exports = (app) => {
  app.command('brr', brr());
  app.command('buildhint', buildHint());
  app.command('buildHint', buildHint());
  app.command('burninfo', burnInfo());
  app.command('burnInfo', burnInfo());
  app.command('convert', convert());
  app.command('checkaprrate', checkAPRRate());
  app.command('checkAPRRate', checkAPRRate());
  app.command('collectedfeesintwei', collectedFeesInTwei());
  app.command('collectedFeesInTwei', collectedFeesInTwei());
  app.command('daocampaigndetails', daoCampaignDetails());
  app.command('daoCampaignDetails', daoCampaignDetails());
  app.command('daocampaignids', daoCampaignIds());
  app.command('daoCampaignIds', daoCampaignIds());
  app.command('daocampaignvotecount', daoCampaignVoteCount());
  app.command('daoCampaignVoteCount', daoCampaignVoteCount());
  app.command('daoinfo', daoInfo());
  app.command('daoInfo', daoInfo());
  app.command('daolateststakerreward', daoLatestStakerPercentage());
  app.command('daoLatestStakerReward', daoLatestStakerPercentage());
  app.command('daoshouldburnreward', daoShouldBurnReward());
  app.command('daoShouldBurnReward', daoShouldBurnReward());
  app.command('daostakerreward', daoStakerRewardPercentage());
  app.command('daoStakerReward', daoStakerRewardPercentage());
  app.command('daototalepochpoints', daoTotalEpochPoints());
  app.command('daoTotalEpochPoints', daoTotalEpochPoints());
  app.command('daocampaignwindata', daoCampaignWinData());
  app.command('daoCampaignWinData', daoCampaignWinData());
  app.command('debugreserve', debugReserve());
  app.command('debugReserve', debugReserve());
  app.command('dmmampfromdiff', dmmAmpFromDiff());
  app.command('dmmAmpFromDiff', dmmAmpFromDiff());
  app.command('dmmrangefromamp', dmmRangeFromAmp());
  app.command('dmmRangeFromAmp', dmmRangeFromAmp());
  app.command('drates', getReservesRates('usd', false));
  app.command('dRates', getReservesRates('usd', false));
  app.command('erates', getReservesRates('eth', false));
  app.command('eRates', getReservesRates('eth', false));
  app.command('feelatestsanityrate', feeLatestSanityRate());
  app.command('feeLatestSanityRate', feeLatestSanityRate());
  app.command('feesanityrates', feeSanityRates());
  app.command('feeSanityRates', feeSanityRates());
  app.command('fromtwei', fromTwei());
  app.command('fromTwei', fromTwei());
  app.command('fromwei', fromWei());
  app.command('fromWei', fromWei());
  app.command('getconversionrate', getConversionRate());
  app.command('getConversionRate', getConversionRate());
  app.command('gas', gasPrice());
  app.command('getexpectedrate', getExpectedRate());
  app.command('getExpectedRate', getExpectedRate());
  app.command('getexpectedrateafterfee', getExpectedRateAfterFee());
  app.command('getExpectedRateAfterFee', getExpectedRateAfterFee());
  app.command('getreservesrates', getReservesRates('', false));
  app.command('getReservesRates', getReservesRates('', false));
  app.command('h', h());
  app.command('isreservelisted', isReserveListed());
  app.command('isReserveListed', isReserveListed());
  app.command('latestblock', latestBlock());
  app.command('latestBlock', latestBlock());
  app.command('lateststakerdata', latestStakerData());
  app.command('latestStakerData', latestStakerData());
  app.command('liquidityparams', liquidityParams());
  app.command('liquidityParams', liquidityParams());
  app.command('liquidityrate', liquidityRate());
  app.command('liquidityRate', liquidityRate());
  app.command('lp', lp());
  app.command('maxgasprice', maxGasPrice());
  app.command('maxGasPrice', maxGasPrice());
  app.command('networkcontracts', networkContracts());
  app.command('networkContracts', networkContracts());
  app.command('networkinfo', networkInfo());
  app.command('networkInfo', networkInfo());
  app.command('newreserveid', newReserveId());
  app.command('newReserveId', newReserveId());
  app.command('optimisetrade', optimiseTrade());
  app.command('optimiseTrade', optimiseTrade());
  app.command('parsehint', parseHint());
  app.command('parseHint', parseHint());
  app.command('permissions', permissions());
  app.command('prrfees', prrFees());
  app.command('prrFees', prrFees());
  app.command('rates', getReservesRates('', false));
  app.command('rateswithconfig', getReservesRates('', true));
  app.command('ratesWithConfig', getReservesRates('', true));
  app.command('reservebalances', reserveBalances());
  app.command('reserveBalances', reserveBalances());
  app.command('reservecontracts', reserveContracts());
  app.command('reserveContracts', reserveContracts());
  app.command('reserveidtoascii', reserveIdToAscii());
  app.command('reserveIdToAscii', reserveIdToAscii());
  app.command('reserveinfo', reserveInfo());
  app.command('reserveInfo', reserveInfo());
  app.command('reserveindex', reserveIndex());
  app.command('reserveIndex', reserveIndex());
  app.command('reserverebates', reserveRebates());
  app.command('reserveRebates', reserveRebates());
  app.command('reserves', reserves());
  app.command('reservespertoken', reservesPerToken());
  app.command('reservesPerToken', reservesPerToken());
  app.command('rewards', rewards());
  app.command('sentiment', sentiment());
  app.command('slippage', slippage(false));
  app.command('slippagewithconfig', slippage(true));
  app.command('slippageWithConfig', slippage(true));
  app.command('spread', spread(false));
  app.command('spreadwithconfig', spread(true));
  app.command('spreadWithConfig', spread(true));
  app.command('stakerdata', stakerData());
  app.command('stakerData', stakerData());
  app.command('stakerrawdata', stakerRawData());
  app.command('stakerRawData', stakerRawData());
  app.command('stakingapy', stakingAPY());
  app.command('stakingAPY', stakingAPY());
  app.command('tokenaddress', tokenAddress());
  app.command('tokenAddress', tokenAddress());
  app.command('tokeninfo', tokenInfo());
  app.command('tokenInfo', tokenInfo());
  app.command('tokensperreserve', tokensPerReserve());
  app.command('tokensPerReserve', tokensPerReserve());
  app.command('totalstaked', totalStaked());
  app.command('totalStaked', totalStaked());
  app.command('totwei', toTwei());
  app.command('toTwei', toTwei());
  app.command('towei', toWei());
  app.command('toWei', toWei());
  app.command('trates', getReservesRates('token', false));
  app.command('tRates', getReservesRates('token', false));
  app.command('update', update());

  logger.info('Initialized commands');
};
