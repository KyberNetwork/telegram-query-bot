require('dotenv').config();

const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { ethgasstation, gasnow } = axios;
    const { inReplyTo } = Extra;
    const { ethers } = helpers.getEthLib('mainnet');

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    const gasPrice1 = (await ethgasstation.get('json/ethgasAPI.json', {
      'api-key': process.env.DEFIPULSE_KEY,
    })).data;
    const gasPrice2 = (await gasnow.get('api/v3/gas/price?utm_source=:TelegramBot')).data.data;
    

    let result = '';
    result = result.concat(
      '**ETHGasStation.info**\n',
      `fastest: \`${gasPrice1.fastest / 10}\`\n`,
      `fast: \`${gasPrice1.fast / 10}\`\n`,
      `average: \`${gasPrice1.average / 10}\`\n`,
      `slow: \`${gasPrice1.safeLow / 10}\`\n\n`,
      '**GasNow.org**\n',
      `fastest: \`${ethers.utils.formatUnits(gasPrice2.rapid, 'gwei')}\`\n`,
      `fast: \`${ethers.utils.formatUnits(gasPrice2.fast, 'gwei')}\`\n`,
      `average: \`${ethers.utils.formatUnits(gasPrice2.standard, 'gwei')}\`\n`,
      `slow: \`${ethers.utils.formatUnits(gasPrice2.slow, 'gwei')}\``,
    );

    replyWithMarkdown(result, inReplyTo(message.message_id));
  };
};
