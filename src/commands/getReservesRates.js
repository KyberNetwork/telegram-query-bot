const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { axios, contracts, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetwork, KyberNetworkStaging } = contracts;
    const { args } = state.command;

    if (args.length < 2) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
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

    let result;
    if (args[2] && args[2].toLowerCase() === 'staging') {
      result = await KyberNetworkStaging.methods.getReservesRates(
        token.address,
        qty.toString(),
      ).call();
    } else {
      result = await KyberNetwork.methods.getReservesRates(
        token.address,
        qty.toString(),
      ).call();
    }

    let msg = '*BUY*\n';
    for (var index in result.buyReserves) {
      msg = msg.concat(`${index}] ${result.buyReserves[index]} : ${web3.utils.fromWei(result.buyRates[index].toString())}\n`);
    }
    msg = msg.concat('\n*SELL*\n');
    for (var index in result.sellReserves) {
      msg = msg.concat(`${index}] ${result.sellReserves[index]} : ${web3.utils.fromWei(result.sellRates[index].toString())}\n`);
    }

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
