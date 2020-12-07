const logger = require('../logger');
const axios = require('./axios');
const ethereum = require('./ethereum');

module.exports = (app) => {
  app.context.axios = axios;
  app.context.ethereum = ethereum;

  logger.info('Initialized plugins');
};
