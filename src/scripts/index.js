// const aprRatesChecker = require('./aprRatesChecker');
const sanityContractChecker = require('./sanityContractChecker');
const logger = require('../logger');

module.exports = (app) => {
  // aprRatesChecker(app);
  sanityContractChecker(app);

  logger.info('Initialized scripts');
};
