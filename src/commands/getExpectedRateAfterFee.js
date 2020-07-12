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

    if (args.length < 4) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 4 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    let srcToken = args[0];
    let destToken = args[1];
    let srcQty = args[2];
    let platformFeeBps = args[3];
    let hint = '0x';
    let network;

    if (args[4]) {
      if (['mainnet', 'staging', 'ropsten', 'kovan', 'rinkeby'].includes(args[4])) {
        network = args[4];
      } else {
        hint = args[4];
        network = (args[5]) ? args[5].toLowerCase() : 'mainnet';
      }
    } else {
      network = 'mainnet';
    }

    const {ethers: ethers, provider: provider} = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    

    if (srcToken.toUpperCase() === 'ETH') {
      srcToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !srcToken.startsWith('0x') &&
      (['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1)
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
      (['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1)
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
      srcQty = ethers.utils.parseEther(srcQty);
    } else {
      const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
      const srcTokenInstance = new ethers.Contract(srcToken.address, tokenABI, provider);
      const decimals = srcToken.decimals || await srcTokenInstance.decimals();
      srcQty = Math.round(srcQty * (10 ** decimals)).toLocaleString('fullwide', {useGrouping:false});
    }

    const getExpectedRateAfterFee = helpers.getProxyFunction(network, 'getExpectedRateAfterFee');
    const result = await getExpectedRateAfterFee(
      srcToken.address,
      destToken.address,
      srcQty,
      platformFeeBps,
      hint,
    );

    const expectedRate = Number(ethers.utils.formatEther(result)).toFixed(5);

    replyWithMarkdown(`Expected Rate: \`${expectedRate} (${result})\``, inReplyTo(message.message_id));
  };
};
