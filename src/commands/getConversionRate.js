const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 5) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 5 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[5]) ? args[5].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const currencies = (await kyber.get('/currencies')).data.data;
    let reserve = args[0];
    let srcToken = args[1];
    let destToken = args[2];
    let srcQty = args[3];
    let blockNumber = args[4];

    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));

    if (srcToken.toUpperCase() === 'ETH') {
      srcToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !srcToken.startsWith('0x') &&
      (network.toLowerCase() == 'mainnet' || network.toLowerCase() == 'staging')
    ) {
      srcToken = currencies.find(o => o.symbol === srcToken.toUpperCase());
    } else if (
      srcToken.length === 42 &&
      srcToken.startsWith('0x')
    ) {
      srcToken = { address: srcToken };
    } else {
      srcToken = undefined;
    }

    if (destToken.toUpperCase() === 'ETH') {
      destToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !destToken.startsWith('0x') &&
      (network.toLowerCase() == 'mainnet' || network.toLowerCase() == 'staging')
    ) {
      destToken = currencies.find(o => o.symbol === destToken.toUpperCase());
    } else if (
      destToken.length === 42 &&
      destToken.startsWith('0x')
    ) {
      destToken = { address: destToken };
    } else {
      destToken = undefined;
    }

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    if (srcToken.symbol === 'ETH' || srcToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      srcQty = web3.utils.toWei(srcQty);
    } else {
      const srcTokenInstance = new web3.eth.Contract(tokenABI, srcToken.address);
      const decimals = srcToken.decimals || await srcTokenInstance.methods.decimals().call();
      srcQty = Math.round(srcQty * (10 ** decimals)).toLocaleString('fullwide', {useGrouping:false});
    }

    if (blockNumber == 'latest') {
      blockNumber = (await web3.eth.getBlock('latest')).number;
    }

    const result = await reserveInstance.methods.getConversionRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
      blockNumber.toString(),
    ).call();

    if (!result) {
      reply('Invalid reserve address.', inReplyTo(message.message_id));
      return;
    }

    replyWithMarkdown(`${web3.utils.fromWei(result.toString())}`, inReplyTo(message.message_id));
  };
};
