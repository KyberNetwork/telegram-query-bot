const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (args.length < 3) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 3 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[3] ? args[3].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    let qty = args[0];
    let srcToken = args[1];
    let destToken = args[2];

    if (srcToken.toUpperCase() === 'ETH') {
      srcToken = {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        symbol: 'ETH',
      };
    } else if (
      !srcToken.startsWith('0x') &&
      ['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1
    ) {
      srcToken = currencies.find((o) => o.symbol === srcToken.toUpperCase());
    } else if (srcToken.length === 42 && srcToken.startsWith('0x')) {
      srcToken = { address: srcToken };
    } else {
      srcToken = undefined;
    }

    if (destToken.toUpperCase() === 'ETH') {
      destToken = {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        symbol: 'ETH',
      };
    } else if (
      !destToken.startsWith('0x') &&
      ['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1
    ) {
      destToken = currencies.find((o) => o.symbol === destToken.toUpperCase());
    } else if (destToken.length === 42 && destToken.startsWith('0x')) {
      destToken = { address: destToken };
    } else {
      destToken = undefined;
    }

    if (!srcToken || !destToken) {
      reply(
        'Invalid source or destination token symbol.',
        inReplyTo(message.message_id)
      );
      return;
    }

    let srcQty;
    let result;

    if (srcToken.symbol === 'ETH') {
      srcQty = ethers.utils.parseEther(qty);
    } else {
      const srcTokenInstance = new ethers.Contract(
        srcToken.address,
        tokenABI,
        provider
      );
      const decimals = srcToken.decimals || (await srcTokenInstance.decimals());
      srcToken.symbol = srcToken.symbol || (await srcTokenInstance.symbol());
      srcQty = Math.round(qty * 10 ** decimals).toLocaleString('fullwide', {
        useGrouping: false,
      });
    }

    if (destToken.symbol !== 'ETH') {
      const destTokenInstance = new ethers.Contract(
        destToken.address,
        tokenABI,
        provider
      );
      destToken.symbol = destToken.symbol || (await destTokenInstance.symbol());
    }

    const getExpectedRate = helpers.getProxyFunction(
      network,
      'getExpectedRate'
    );
    result = await getExpectedRate(srcToken.address, destToken.address, srcQty);

    if (result.expectedRate === '0') {
      reply('Conversion for the pair is unavailable.');
      return;
    }

    result = Number(
      ethers.utils.formatEther(result.expectedRate) * qty
    ).toFixed(5);

    replyWithMarkdown(
      `\`${qty}\` ${srcToken.symbol} => \`${result}\` ${destToken.symbol}`,
      inReplyTo(message.message_id)
    );
  };
};
