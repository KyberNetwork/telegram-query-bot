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
    case 'usd':
      label = ' (in USD)';
      break;
    default:
      label = '';
      break;
  }

  return label;
}

async function formatValue(web3, type, rate, isBuy, medianizer) {
  let value;
  let usd;

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
    case 'usd':
      usd = web3.utils.toBN(await medianizer.methods.read().call());
      if (isBuy) {
        value = rate > 0 ? 1 / web3.utils.fromWei(rate.toString()) : 0;
        value *= web3.utils.fromWei(usd);
        value = `$${value}`;
      } else {
        value = web3.utils.fromWei(rate.toString());
        value *= web3.utils.fromWei(usd);
        value = `$${value}`;
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
    const { axios, contracts, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = args[2] ? args[2].toLowerCase() : 'mainnet';
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

    const getReservesRates = helpers.getRateFunction(
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
      let reserveAscii;
      let reserveType;
      for (let index in resultETH.buyReserves) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(resultETH.buyReserves[index]);
        msgValue = await formatValue(
          web3,
          type,
          resultETH.buyRates[index],
          true,
          contracts[network].Medianizer,
        );
        msg = msg.concat(
          `${index}] ${resultETH.buyReserves[index].replace(/0+$/, '')}`,
          ` (${reserveAscii} [[${reserveType}]]) : `,
          `\`${msgValue}\`\n`,
        );
      }
      msg = msg.concat(`\n*SELL${formatLabel(type, symbol)}*\n`);
      for (let index in resultToken.sellReserves) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(resultETH.sellReserves[index]);
        msgValue = await formatValue(
          web3,
          type,
          resultToken.sellRates[index],
          false,
          contracts[network].Medianizer,
        );
        msg = msg.concat(
          `${index}] ${resultETH.sellReserves[index].replace(/0+$/, '')}`,
          ` (${reserveAscii} [[${reserveType}]]) : `,
          `\`${msgValue}\`\n`,
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
