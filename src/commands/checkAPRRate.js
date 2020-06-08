const BN = require('bn.js');
const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 1) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`);
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const reserve = args[0].toLowerCase();
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);
    const conversionRates = await reserveInstance.methods.conversionRatesContract().call();

    if (!conversionRates) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }
    
    const conversionRatesABI = JSON.parse(fs.readFileSync('src/contracts/abi/LiquidityConversionRates.abi', 'utf8'));
    const conversionRatesInstance = new web3.eth.Contract(conversionRatesABI, conversionRates);

    try {
      const token = await conversionRatesInstance.methods.token().call();
      const rInFp = await conversionRatesInstance.methods.rInFp().call();
      const formulaPrecision = await conversionRatesInstance.methods.formulaPrecision().call();
      const r = rInFp / formulaPrecision;

      let r1 = await conversionRatesInstance.methods.getRate(
        token,
        (await web3.eth.getBlock('latest')).number,
        true,
        web3.utils.toWei('1')
      ).call();
      r1 = r1 > 0 ? 1 / web3.utils.fromWei(r1.toString()) : 0;

      let r2 = await conversionRatesInstance.methods.getRate(
        token,
        (await web3.eth.getBlock('latest')).number,
        true,
        web3.utils.toWei('2')
      ).call();
      r2 = r2 > 0 ? 1 / web3.utils.fromWei(r2.toString()) : 0;

      const rComputed = ((r2 - r1) / r1) * 2;
      
      let msg = '';
      msg = msg.concat(
        `r: \`${r}\`\n`,
        `Computed r from rate: \`${rComputed}\`\n`,
        (10 ** -7) > (r - rComputed)
          ? '*Rate COMPLIES with liquidity param settings*'
          : '*Rate DOES NOT COMPLY with liquidity param settings*',
      );
    
      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      reply('Reserve is not an APR', inReplyTo(message.message_id));
    }
  };
};
