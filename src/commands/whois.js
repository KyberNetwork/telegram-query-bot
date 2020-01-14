const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;
    const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));
    const addresses = JSON.parse(fs.readFileSync(config.whois.file, 'utf8'));

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const address = args[0];

    if (!address.startsWith('0x')) {
      reply('Invalid address.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    let result = Object.keys(addresses).find(o => o.toLowerCase() === address.toLowerCase());
    if (result) {
      result = addresses[result];
    } else {
      const currencies = (await axios.get('/currencies')).data.data;
      result = currencies.find(o => o.address.toLowerCase() === address.toLowerCase());
      result = `${result.symbol} Token`;
    }

    replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
  };
};
