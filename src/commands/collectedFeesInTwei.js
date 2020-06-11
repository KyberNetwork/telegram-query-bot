const BN = require('bn.js');
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
    const token = await conversionRatesInstance.methods.token().call();
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const tokenInstance = new web3.eth.Contract(tokenABI, token);

    const result = await conversionRatesInstance.methods.collectedFeesInTwei().call();

    replyWithMarkdown(
      `${
        new BN(result.toString()) / new BN(
          String(10 ** await tokenInstance.methods.decimals().call())
        )
      } ${await tokenInstance.methods.symbol().call()}`,
      inReplyTo(message.message_id)
    );
  };
};
