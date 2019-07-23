const logger = require('../logger');
const commandArgs = require('./commandArgs');

module.exports = app => {
  app.use(commandArgs());

  logger.info('Initialized middleware');
};
