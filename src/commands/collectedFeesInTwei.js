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
    const token = await conversionRatesInstance.token();
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const tokenInstance = new ethers.Contract(token, tokenABI, provider);

    let result = await conversionRatesInstance.collectedFeesInTwei();
    result = result.div(ethers.BigNumber.from(10).pow(await tokenInstance.decimals()));
    replyWithMarkdown(
      `${result} ${await tokenInstance.symbol()}`,
      inReplyTo(message.message_id)
    );
  };
};
