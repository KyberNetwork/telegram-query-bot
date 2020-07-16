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
    let srcToken = args[0];
    let destToken = args[1];
    let srcQty = args[2];

    if (srcToken.toUpperCase() === 'ETH') {
      srcToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
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
      destToken = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
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
        'Invalid source or destination token symbol or address.',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (
      srcToken.symbol === 'ETH' ||
      srcToken.address.toLowerCase() ===
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      srcQty = ethers.utils.parseEther(srcQty);
    } else {
      const tokenABI = JSON.parse(
        fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
      );
      const srcTokenInstance = new ethers.Contract(
        srcToken.address,
        tokenABI,
        provider
      );
      const decimals = srcToken.decimals || (await srcTokenInstance.decimals());
      srcQty = Math.round(srcQty * 10 ** decimals).toLocaleString('fullwide', {
        useGrouping: false,
      });
    }

    const getExpectedRate = helpers.getProxyFunction(
      network,
      'getExpectedRate'
    );
    const result = await getExpectedRate(
      srcToken.address,
      destToken.address,
      srcQty
    );

    const expectedRate = Number(
      ethers.utils.formatEther(result.expectedRate)
    ).toFixed(5);
    const slippageRate = Number(
      ethers.utils.formatEther(result.worstRate)
    ).toFixed(5);

    replyWithMarkdown(
      `Expected Rate: \`${expectedRate} (${result.expectedRate})\`\n` +
        `Worst Rate: \`${slippageRate} (${result.worstRate})\``,
      inReplyTo(message.message_id)
    );
  };
};
