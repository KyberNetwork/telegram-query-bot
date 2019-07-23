require('dotenv').config();

const Telegraf = require('telegraf');
const commands = require('./commands');
const contracts = require('./contracts');
const middleware = require('./middleware');
const handlers = require('./handlers');
const plugins = require('./plugins');

const app = new Telegraf(process.env.TELEGRAM_TOKEN);

app.telegram.getMe().then(info => {
  app.options.username = info.username;
});

plugins(app);
middleware(app);
commands(app);
contracts(app);
handlers(app);

module.exports = app;
