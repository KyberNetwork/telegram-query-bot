const logger = require('../logger');
const convert = require('./convert');
const debugReserve = require('./debugReserve');
const encodeABI = require('./encodeABI');
const getAddressOfToken = require('./getAddressOfToken');
const getAPRCollectedFees = require('./getAPRCollectedFees');
const getConversionRate = require('./getConversionRate');
const getExpectedRate = require('./getExpectedRate');
const getKNCFeeWallet = require('./getKNCFeeWallet');
const getLiquidityParams = require('./getLiquidityParams');
const getLiquidityRate = require('./getLiquidityRate');
const getReserveBalances = require('./getReserveBalances');
const getReserveFeesInBPS = require('./getReserveFeesInBPS');
const getReserveIndex = require('./getReserveIndex');
const getReservePaidFees = require('./getReservePaidFees');
const getReservesRates = require('./getReservesRates');
const getReservesOfToken = require('./getReservesOfToken');
const getTokensOfReserve = require('./getTokensOfReserve');
const isFeeSharingWallet = require('./isFeeSharingWallet');
const isReserveListed = require('./isReserveListed');
const update = require('./update');

module.exports = app => {
  app.command('convert', convert());
  app.command('debugreserve', debugReserve());
  app.command('debugReserve', debugReserve());
  app.command('encodeabi', encodeABI());
  app.command('encodeABI', encodeABI());
  app.command('getaddressoftoken', getAddressOfToken());
  app.command('getAddressOfToken', getAddressOfToken());
  app.command('getaprcollectedfees', getAPRCollectedFees());
  app.command('getAPRCollectedFees', getAPRCollectedFees());
  app.command('getconversionrate', getConversionRate());
  app.command('getConversionRate', getConversionRate());
  app.command('getexpectedrate', getExpectedRate());
  app.command('getExpectedRate', getExpectedRate());
  app.command('getkncfeewallet', getKNCFeeWallet());
  app.command('getKNCFeeWallet', getKNCFeeWallet());
  app.command('getliquidityparams', getLiquidityParams());
  app.command('getLiquidityParams', getLiquidityParams());
  app.command('getliquidityrate', getLiquidityRate());
  app.command('getLiquidityRate', getLiquidityRate());
  app.command('getreservebalances', getReserveBalances());
  app.command('getReserveBalances', getReserveBalances());
  app.command('getreservefeesinbps', getReserveFeesInBPS());
  app.command('getReserveFeesInBPS', getReserveFeesInBPS());
  app.command('getreserveindex', getReserveIndex());
  app.command('getReserveIndex', getReserveIndex());
  app.command('getreservepaidfees', getReservePaidFees());
  app.command('getReservePaidFees', getReservePaidFees());
  app.command('getreservesrates', getReservesRates());
  app.command('getReservesRates', getReservesRates());
  app.command('getreservesoftoken', getReservesOfToken());
  app.command('getReservesOfToken', getReservesOfToken());
  app.command('gettokensofreserve', getTokensOfReserve());
  app.command('getTokensOfReserve', getTokensOfReserve());
  app.command('isfeesharingwallet', isFeeSharingWallet());
  app.command('isFeeSharingWallet', isFeeSharingWallet());
  app.command('isreservelisted', isReserveListed());
  app.command('isReserveListed', isReserveListed());
  app.command('update', update());

  logger.info('Initialized commands');
};
