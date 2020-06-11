const logger = require('../logger');
const commandArgs = require('./commandArgs');
const whitelist = require('./whitelist');

module.exports = app => {
  app.use(whitelist());
  app.use(commandArgs());

  logger.info('Initialized middleware');
};
