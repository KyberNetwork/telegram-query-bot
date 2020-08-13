const Extra = require('telegraf/extra');
const fs = require('fs');

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

function getTokenDetails(currencies, token) {
  if (!token.startsWith('0x')) {
    token = currencies.find((o) => o.symbol === token.toUpperCase());
  } else if (token.length === 42 && token.startsWith('0x')) {
    token = { address: token };
  } else {
    token = undefined;
  }
  return token;
}

function getBestReserve(result, isBuy, zeroBN) {
  let bestRate = zeroBN;
  let bestReserveId = '';
  let reserves;
  let rates;
  let reserveRate;

  if (isBuy) {
    reserves = result.buyReserves;
    rates = result.buyRates;
  } else {
    reserves = result.sellReserves;
    rates = result.sellRates;
  }

  for (let index in reserves) {
    reserveRate = rates[index];
    if (reserveRate.gte(bestRate)) {
      bestRate = reserveRate;
      bestReserveId = reserves[index];
    }
  }
  return {reserveId: bestReserveId, rate: bestRate};
}

function formatMsg(t2eReserve, e2tReserve, hint) {
  let msg = '';
  msg = msg.concat(
    `t2e Reserve: \`${t2eReserve[0]} [${t2eReserve[1]}]\`\n`,
    `e2t Reserve: \`${e2tReserve[0]} [${e2tReserve[1]}]\`\n`,
    `Hint: \`${hint}\``
  );
  return msg;
}

module.exports = () => {
  return async (ctx) => {
    const {
      axios,
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

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let network = 'mainnet';
    let qty;

    if (args[2]) {
      if (
        helpers.networks.includes(
          args[2].toLowerCase()
        )
      ) {
        network = args[2].toLowerCase();
      } else {
        qty = args[2];
      }
    }

    network = args[3] ? args[3].toLowerCase() : network;
    const { ethers, provider } = helpers.getEthLib(network);
    const tokenABI = JSON.parse(
      fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8')
    );
    const currencies = (await kyber(network).get('/currencies')).data.data;

    if (qty == undefined) {
      qty = '0.5';
    }

    let srcToken = getTokenDetails(currencies, args[0]);
    let destToken = getTokenDetails(currencies, args[1]);
    if (!srcToken || !destToken) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id));
      return;
    }
    
    const tokenInstance = new ethers.Contract(
      srcToken.address,
      tokenABI,
      provider
    );
    const decimals = srcToken.decimals || (await tokenInstance.decimals());
    qty = ethers.BigNumber.from((qty * 10 ** decimals).toString());

    const getReservesRates = helpers.getRateFunction(
      network,
      'getReservesRates'
    );
    let t2eResult;
    let e2tResult;
    try {
      t2eResult = await getReservesRates(srcToken.address, qty);
      t2eResult = getBestReserve(
        t2eResult,
        false,
        ethers.constants.Zero
      );

      qty = (srcToken.address == ETH_ADDRESS) ?
        qty :
        qty.mul(t2eResult.rate).div(ethers.constants.WeiPerEther);

      e2tResult = await getReservesRates(destToken.address, qty);
      e2tResult = getBestReserve(
        e2tResult,
        true,
        ethers.constants.Zero
      );

      let buildHintFunction;
      let buildHintArgs;
      if (destToken.address == ETH_ADDRESS) {
        buildHintFunction = 'buildTokenToEthHint';
        buildHintArgs = [
          srcToken.address,
          3,
          [t2eResult.reserveId],
          [10000]
        ];
      } else if (srcToken.address == ETH_ADDRESS) {
        buildHintFunction = 'buildEthToTokenHint';
        buildHintArgs = [
          destToken.address,
          3,
          [e2tResult.reserveId],
          [10000]
        ];
      } else {
        buildHintFunction = 'buildTokenToTokenHint';
        buildHintArgs = [
          srcToken.address,
          3,
          [t2eResult.reserveId],
          [10000],
          destToken.address,
          3,
          [e2tResult.reserveId],
          [10000],
        ];
      }

      const buildHint = helpers.getMatchingEngineFunction(network, buildHintFunction);
      const hint = await buildHint(...buildHintArgs);

      let msg = formatMsg(
        helpers.reserveIdToAscii(t2eResult.reserveId),
        helpers.reserveIdToAscii(e2tResult.reserveId),
        hint
      );
      
      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.toString(), inReplyTo(message.message_id));
    }
  };
};
