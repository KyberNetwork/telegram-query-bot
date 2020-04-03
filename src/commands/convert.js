const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 3) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 3 provided.`);
      return;
    }

    const network = (args[3]) ? args[3].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const currencies = (await kyber.get('/currencies')).data.data;
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
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
      destToken = {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        symbol: 'ETH',
      };
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
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    let srcQty;
    let result;

    if (srcToken.symbol === 'ETH') {
      srcQty = web3.utils.toWei(qty);
    } else {
      const srcTokenInstance = new web3.eth.Contract(tokenABI, srcToken.address);
      const decimals = srcToken.decimals || await srcTokenInstance.methods.decimals().call();
      srcToken.symbol = srcToken.symbol || await srcTokenInstance.methods.symbol().call();
      srcQty = Math.round(qty * (10 ** decimals)).toLocaleString('fullwide', {useGrouping:false});
    }

    if (destToken.symbol !== 'ETH') {
      const destTokenInstance = new web3.eth.Contract(tokenABI, destToken.address);
      destToken.symbol = destToken.symbol || await destTokenInstance.methods.symbol().call();
    }

    const getExpectedRate = helpers.getProxyFunction(network, 'getExpectedRate');
    result = await getExpectedRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
    ).call();

    if (result.expectedRate === '0') {
      reply('Conversion for the pair is unavailable.');
      return;
    }

    result = web3.utils.fromWei(result.expectedRate.toString()) * qty;

    replyWithMarkdown(`*${qty} ${srcToken.symbol} => ${result} ${destToken.symbol}*`, inReplyTo(message.message_id));
  };
};
