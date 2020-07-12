const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const {ethers: ethers, provider: provider} = helpers.getEthLib(network);
    const reserve = args[0].toLowerCase();
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new ethers.Contract(reserve, reserveABI, provider);
    const conversionRates = await reserveInstance.conversionRatesContract();

    if (!conversionRates) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }
    
    const conversionRatesABI = JSON.parse(fs.readFileSync('src/contracts/abi/LiquidityConversionRates.abi', 'utf8'));
    const conversionRatesInstance = new ethers.Contract(conversionRates, conversionRatesABI, provider);

    try {
      const token = await conversionRatesInstance.token();
      const rInFp = await conversionRatesInstance.rInFp();
      const formulaPrecision = await conversionRatesInstance.formulaPrecision();
      const r = rInFp / formulaPrecision;

      let r1 = await conversionRatesInstance.getRate(
        token,
        await provider.getBlockNumber(),
        true,
        ethers.utils.parseEther('1')
      );
      r1 = r1 > 0 ? 1 / ethers.utils.formatEther(r1.toString()) : 0;

      let r2 = await conversionRatesInstance.getRate(
        token,
        await provider.getBlockNumber(),
        true,
        ethers.utils.parseEther('2')
      );
      r2 = r2 > 0 ? 1 / ethers.utils.formatEther(r2.toString()) : 0;

      let r3 = await conversionRatesInstance.getRate(
        token,
        await provider.getBlockNumber(),
        true,
        ethers.utils.parseEther('3')
      );
      r3 = r3 > 0 ? 1 / ethers.utils.formatEther(r3.toString()) : 0;

      const rComputed1 = ((r2 - r1) / r1) * 2;
      const rComputed2 = (r3 - r1) / r1;
      
      let msg = '';
      msg = msg.concat(
        `r: \`${r}\`\n`,
        `Computed r from 2 ETH rate: \`${rComputed1}\`\n`,
        `Computed r from 3 ETH rate: \`${rComputed2}\`\n`,
        ((10 ** -7) > (r - rComputed1) && (10 ** -7) > (r - rComputed2))
          ? '*Rate COMPLIES with liquidity param settings*'
          : '*Rate DOES NOT COMPLY with liquidity param settings*',
      );
    
      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      reply('Reserve is not an APR', inReplyTo(message.message_id));
    }
  };
};
