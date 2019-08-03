const BN = require('bn.js');
const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 1 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    const reserve = args[0].toLowerCase();
    const token = currencies.find(o => {
      if (o.reserves_src) {
        return o.reserves_src.find(a => {
          if (a.toLowerCase() === reserve) {
            return o.address;
          }
        });
      }
    });

    if (!token) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);
    const conversionRates = await reserveInstance.methods.conversionRatesContract().call();
    const conversionRatesABI = JSON.parse(fs.readFileSync('src/contracts/abi/LiquidityConversionRates.abi', 'utf8'));
    const conversionRatesInstance = new web3.eth.Contract(conversionRatesABI, conversionRates);

    const result = await conversionRatesInstance.methods.collectedFeesInTwei().call();

    replyWithMarkdown(`*${new BN(result.toString()).div(new BN(String(10 ** token.decimals)))} ${token.symbol}*`, inReplyTo(message.message_id));
  };
};
