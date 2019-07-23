const logger = require('../logger');
const axios = require('./axios');
const web3 = require('./web3');

module.exports = app => {
  app.context.axios = axios;
  app.context.web3 = web3;

  logger.info('Initialized plugins');
};
