const Extra = require('telegraf/extra');
const fs = require('fs');

function formatLabel(type, symbol) {
  let label;

  switch (type) {
    case 'eth':
      label = ' (in ETH)';
      break;
    case 'token':
      label = ` (in ${symbol.toUpperCase()})`;
      break;
    default:
      label = '';
      break;
  }

  return label;
}
function formatValue(web3, type, rate, isBuy) {
  let value;

  switch (type) {
    case 'eth':
      if (isBuy) {
        value = rate > 0 ? 1 / web3.utils.fromWei(rate.toString()) : 0;
      } else {
        value = web3.utils.fromWei(rate.toString());
      }
      break;
    case 'token':
      if (isBuy) {
        value = web3.utils.fromWei(rate.toString());
      } else {
        value = rate > 0 ? 1 / web3.utils.fromWei(rate.toString()) : 0;
      }
      break;
    default:
      value = web3.utils.fromWei(rate.toString());
      break;
  }

  return value;
}

module.exports = (type) => {
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
    const qty = args[1];

    let token = args[0];
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
    const symbol =
      token.symbol || (await tokenInstance.methods.symbol().call());
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

      let msg = `*BUY${formatLabel(type, symbol)}*\n`;
      let msgValue = '';
      for (let index in resultETH.buyReserves) {
        msgValue = formatValue(web3, type, resultETH.buyRates[index], true);
        msg = msg.concat(
          `${index}] ${resultETH.buyReserves[index]} : ${msgValue}\n`
        );
      }
      msg = msg.concat(`\n*SELL${formatLabel(type, symbol)}*\n`);
      for (let index in resultToken.sellReserves) {
        msgValue = formatValue(web3, type, resultToken.sellRates[index], false);
        msg = msg.concat(
          `${index}] ${resultToken.sellReserves[index]} : ${msgValue}\n`
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
