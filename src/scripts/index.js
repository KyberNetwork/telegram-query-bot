const aprRatesChecker = require('./aprRatesChecker');
const logger = require('../logger');

module.exports = (app) => {
  aprRatesChecker(app);

  logger.info('Initialized scripts');
};
