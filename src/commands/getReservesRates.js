const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 2) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`);
      return;
    }

    const network = (args[2]) ? args[2].toLowerCase() : '';
    const web3 = helpers.getWeb3(network);
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const currencies = (await axios.get('/currencies')).data.data;
    let token = args[0];
    let qty = args[1];

    if (!token.startsWith('0x')) {
      token = currencies.find(o => o.symbol === token.toUpperCase());
    } else if (token.length === 42 && token.startsWith('0x')) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (token.symbol === 'ETH' || token.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      qty = web3.utils.toWei(qty);
    } else {
      const tokenInstance = new web3.eth.Contract(tokenABI, token.address);
      const decimals = token.decimals || await tokenInstance.methods.decimals().call();
      qty = Math.round(qty * (10 ** decimals)).toLocaleString('fullwide', {useGrouping:false});
    }

    const getReservesRates = helpers.getNetworkFunction(network, 'getReservesRates');
    const result = await getReservesRates(
      token.address,
      qty.toString(),
    ).call();  

    let msg = '*BUY*\n';
    for (let index in result.buyReserves) {
      msg = msg.concat(`${index}] ${result.buyReserves[index]} : ${web3.utils.fromWei(result.buyRates[index].toString())}\n`);
    }
    msg = msg.concat('\n*SELL*\n');
    for (let index in result.sellReserves) {
      msg = msg.concat(`${index}] ${result.sellReserves[index]} : ${web3.utils.fromWei(result.sellRates[index].toString())}\n`);
    }

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
