const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 3) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 3 provided.`);
      return;
    }

    const network = (args[3]) ? args[3].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const currencies = (await axios.get('/currencies')).data.data;
    let srcToken = args[0];
    let destToken = args[1];
    let srcQty = args[2];

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
      reply('Invalid source or destination token symbol or address.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (srcToken.symbol === 'ETH' || srcToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      srcQty = web3.utils.toWei(srcQty);
    } else {
      const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
      const srcTokenInstance = new web3.eth.Contract(tokenABI, srcToken.address);
      const decimals = srcToken.decimals || await srcTokenInstance.methods.decimals().call();
      srcQty = Math.round(srcQty * (10 ** decimals)).toLocaleString('fullwide', {useGrouping:false});
    }

    const getExpectedRate = helpers.getProxyFunction(network, 'getExpectedRate');
    const result = await getExpectedRate(
      srcToken.address,
      destToken.address,
      srcQty.toString(),
    ).call();

    const expectedRate = web3.utils.fromWei(result.expectedRate.toString());
    const slippageRate = web3.utils.fromWei(result.slippageRate.toString());

    replyWithMarkdown(`*Expected Rate: ${expectedRate}\nSlippage Rate: ${slippageRate}*`, inReplyTo(message.message_id));
  };
};
