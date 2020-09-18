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

async function formatValue(utils, type, rate, isBuy, medianizer) {
  let value;
  let usd;

  switch (type) {
    case 'eth':
      if (isBuy) {
        value = rate > 0 ? 1 / utils.formatUnits(rate, 'ether') : 0;
      } else {
        value = utils.formatEther(rate.toString());
      }
      value = Number(value);
      break;
    case 'token':
      if (isBuy) {
        value = utils.formatUnits(rate, 'ether');
      } else {
        value = rate > 0 ? 1 / utils.formatUnits(rate, 'ether') : 0;
      }
      value = Number(value);
      break;
    case 'usd':
      usd = await medianizer.read();
      if (isBuy) {
        value = rate > 0 ? 1 / utils.formatUnits(rate, 'ether') : 0;
      } else {
        value = utils.formatUnits(rate, 'ether');
      }
      value *= utils.formatUnits(usd, 'ether');
      value = Number(value).toFixed(2);
      value = `$${value}`;
      break;
    default:
      value = utils.formatUnits(rate, 'ether');
      value = Number(value);
      break;
  }

  return value;
}

module.exports = (type, config) => {
  return async (ctx) => {
    const {
      axios,
      contracts,
      helpers,
      message,
      reply,
      replyWithMarkdown,
      state,
    } = ctx;
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

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let network = 'mainnet';
    let qty;

    if (args[1]) {
      if (helpers.networks.includes(args[1].toLowerCase())) {
        network = args[1].toLowerCase();
      } else {
        qty = args[1];
      }
    }

    network = args[2] ? args[2].toLowerCase() : network;
    const { ethers, provider } = helpers.getEthLib(network);
    const utils = ethers.utils;
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const currencies = (await kyber(network).get('/currencies')).data.data;

    if (qty == undefined) {
      qty = '0';
    }

    let token = args[0];
    if (!token.startsWith('0x')) {
      token = currencies.find((o) => o.symbol === token.toUpperCase());
    } else if (token.length === 42 && token.startsWith('0x')) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    const tokenInstance = new ethers.Contract(
      token.address,
      tokenABI,
      provider
    );
    const decimals = token.decimals || (await tokenInstance.decimals());
    const symbol = token.symbol || (await tokenInstance.symbol());
    const qtyToken = Math.round(qty * 10 ** decimals).toLocaleString(
      'fullwide',
      { useGrouping: false }
    );
    const qtyETH = utils.parseEther(qty);

    const getReservesRates = helpers.getRateFunction(
      network,
      config ? 'getReservesRatesWithConfigReserves' : 'getReservesRates'
    );
    let resultETH;
    let resultToken;
    try {
      resultETH = await getReservesRates(token.address, qtyETH);
      resultToken = await getReservesRates(token.address, qtyToken);
      const buyReservesETH =
        resultToken[config ? 'reserves' : 'buyReserves'];
      const sellReservesToken =
        resultToken[config ? 'reserves' : 'sellReserves'];

      let msg = `*BUY${formatLabel(type, symbol)}*\n`;
      let msgValue = '';
      let reserveAscii;
      let reserveType;
      for (let index in buyReservesETH) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(
          buyReservesETH[index]
        );
        msgValue = await formatValue(
          utils,
          type,
          resultETH.buyRates[index],
          true,
          contracts[network].Medianizer
        );
        msg = msg.concat(
          `${index}] ${buyReservesETH[index].replace(/0+$/, '')}`,
          ` (${reserveAscii.replace(/_/g, '\\_')} [[${reserveType}]]) : `,
          `\`${msgValue}\`\n`
        );
      }
      msg = msg.concat(`\n*SELL${formatLabel(type, symbol)}*\n`);
      for (let index in sellReservesToken) {
        [reserveAscii, reserveType] = helpers.reserveIdToAscii(
          sellReservesToken[index]
        );
        msgValue = await formatValue(
          utils,
          type,
          resultToken.sellRates[index],
          false,
          contracts[network].Medianizer
        );
        msg = msg.concat(
          `${index}] ${sellReservesToken[index].replace(/0+$/, '')}`,
          ` (${reserveAscii.replace(/_/g, '\\_')} [[${reserveType}]]) : `,
          `\`${msgValue}\`\n`
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
