const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`
      );
      return;
    }

    const network = args[2] ? args[2].toLowerCase() : '';
    const web3 = helpers.getWeb3(network);
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const currencies = (await kyber.get('/currencies')).data.data;
    let token = args[0];
    let qty = args[1];

    if (!token.startsWith('0x')) {
      token = currencies.find((o) => o.symbol === token.toUpperCase());
    } else if (token.length === 42 && token.startsWith('0x')) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply(
        'Invalid token symbol or address.',
        inReplyTo(message.message_id),
        Extra.markdown()
      );
      return;
    }

    const tokenInstance = new web3.eth.Contract(tokenABI, token.address);
    const decimals =
      token.decimals || (await tokenInstance.methods.decimals().call());
    const qtyToken = Math.round(qty * 10 ** decimals).toLocaleString(
      'fullwide',
      { useGrouping: false }
    );
    const qtyETH = web3.utils.toWei(qty);

    const getReservesRates = helpers.getNetworkFunction(
      network,
      'getReservesRates'
    );
    let resultETH;
    let resultToken;
    try {
      resultETH = await getReservesRates(
        token.address,
        qtyETH.toString()
      ).call();

      resultToken = await getReservesRates(
        token.address,
        qtyToken.toString()
      ).call();

      let msg = '*BUY*\n';
      for (let index in resultETH.buyReserves) {
        msg = msg.concat(
          `${index}] ${resultETH.buyReserves[index]} : ${
            resultETH.buyRates[index] > 0
              ? 1 / web3.utils.fromWei(resultETH.buyRates[index].toString())
              : 0
          }\n`
        );
      }
      msg = msg.concat('\n*SELL*\n');
      for (let index in resultToken.sellReserves) {
        msg = msg.concat(
          `${index}] ${resultToken.sellReserves[index]} : ${web3.utils.fromWei(
            resultToken.sellRates[index].toString()
          )}\n`
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
