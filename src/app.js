require('dotenv').config();

const Telegraf = require('telegraf');
const commands = require('./commands');
const contracts = require('./contracts');
const handlers = require('./handlers');
const helpers = require('./helpers');
const middleware = require('./middleware');
const plugins = require('./plugins');
const scripts = require('./scripts');

const app = new Telegraf(process.env.TELEGRAM_TOKEN);

app.telegram.getMe().then(info => {
  app.options.username = info.username;
});

plugins(app);
middleware(app);
commands(app);
contracts(app);
handlers(app);
helpers(app);
scripts(app);

module.exports = app;
