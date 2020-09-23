require('dotenv').config();

const Extra = require('telegraf/extra');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { etherscan, ethgasstation, gasnow } = axios;
    const { inReplyTo } = Extra;
    const { ethers } = helpers.getEthLib('mainnet');

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    const gasPrice1 = (
      await etherscan.get(
        `api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_KEY}`
      )
    ).data.result;
    const gasPrice2 = (
      await ethgasstation.get('json/ethgasAPI.json', {
        'api-key': process.env.DEFIPULSE_KEY,
      })
    ).data;
    const gasPrice3 = (
      await gasnow.get('api/v3/gas/price?utm_source=:TelegramBot')
    ).data.data;

    let result = '';
    result = result.concat(
      '**Etherscan.io**\n',
      `fast: \`${gasPrice1.FastGasPrice}\`\n`,
      `average: \`${gasPrice1.ProposeGasPrice}\`\n`,
      `slow: \`${gasPrice1.SafeGasPrice}\`\n\n`,
      '**ETHGasStation.info**\n',
      `fastest: \`${gasPrice2.fastest / 10}\`\n`,
      `fast: \`${gasPrice2.fast / 10}\`\n`,
      `average: \`${gasPrice2.average / 10}\`\n`,
      `slow: \`${gasPrice2.safeLow / 10}\`\n\n`,
      '**GasNow.org**\n',
      `fastest: \`${ethers.utils.formatUnits(gasPrice3.rapid, 'gwei')}\`\n`,
      `fast: \`${ethers.utils.formatUnits(gasPrice3.fast, 'gwei')}\`\n`,
      `average: \`${ethers.utils.formatUnits(gasPrice3.standard, 'gwei')}\`\n`,
      `slow: \`${ethers.utils.formatUnits(gasPrice3.slow, 'gwei')}\``
    );

    replyWithMarkdown(result, inReplyTo(message.message_id));
  };
};
