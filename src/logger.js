const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint(),
    format.printf(({ message, timestamp }) => {
      return `${timestamp}] ${message}`;
    }),
  ),
  transports: [
    new transports.Console(
      format.combine(
        format.colorize({ all: true }),
      ),
    ),
    new transports.File({ filename: 'logs/bot.log' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

module.exports = logger;
