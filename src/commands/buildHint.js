const Extra = require('telegraf/extra');

function validateToken(token, network, networks, currencies) {
  if (token.toUpperCase() === 'ETH') {
    return { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
  } else if (
    !token.startsWith('0x') &&
    (networks.indexOf(network) !== -1)
  ) {
    return currencies.find(o => o.symbol === token.toUpperCase());
  } else if (
    token.length === 42 &&
    token.startsWith('0x')
  ) {
    return { address: token };
  } else {
    return;
  }
}

function validateTradeType(tradeType) {
  switch (tradeType.toLowerCase()) {
    case 'bestofall':
      return 0;
    case 'maskin':
      return 1;
    case 'maskout':
      return 2;
    case 'split':
      return 3;
    default:
      return;
  }
}

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot', inReplyTo(message.message_id),
        inReplyTo(message.message_id),
      );
      return;
    }

    if (args.length == 0) {
      reply(
        'ERROR: Invalid number of arguments.',
        inReplyTo(message.message_id),
      );
      return;
    }

    const tradePath = args[0].toLowerCase();

    let func;
    let required;
    switch (tradePath) {
      case 't2e':
        func = 'buildTokenToEthHint';
        required = 5;
        break;
      case 'e2t':
        func = 'buildEthToTokenHint';
        required = 5;
        break;
      case 't2t':
        func = 'buildTokenToTokenHint';
        required = 9;
        break;
      default:
        reply(
          'ERROR: Invalid trade path. Must be t2e, e2t, or t2t.',
          inReplyTo(message.message_id),
        );
        return;
    }

    if (args.length < required) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required ${required} provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[required]) ? args[required].toLowerCase() : 'mainnet';
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const buildHint = helpers.getMatchingEngineFunction(network, func);

    let buildHintArgs = [];
    if (tradePath === 't2e' || tradePath === 'e2t') {
      const token = validateToken(args[1], network, helpers.networks, currencies);

      if (!token) {
        reply(
          'ERROR: Invalid token symbol or address.',
          inReplyTo(message.message_id),
        );
        return;
      }

      const tradeType = validateTradeType(args[2]);

      if (tradeType === undefined) {
        reply(
          'ERROR: Invalid trade type. Must be BestOfAll, MaskIn, MaskOut, or Split.',
          inReplyTo(message.message_id),
        );
        return;
      }

      try {
        let reserveIds = JSON.parse(args[3]).map((e) => helpers.to32Bytes(e));
        let splits = JSON.parse(args[4]).map((e) => helpers.to32Bytes(e));

        buildHintArgs = [
          token.address,
          tradeType,
          reserveIds,
          splits,
        ];
      } catch (e) {
        reply(
          'ERROR: Invalid input in reserveIds or splits array.',
          inReplyTo(message.message_id),
        );
        return;
      }
    } else {
      const t2eTokenSrc = validateToken(args[1], network, helpers.networks, currencies);
      const e2tTokenDest = validateToken(args[5], network, helpers.networks, currencies);

      if (!t2eTokenSrc || !e2tTokenDest) {
        reply(
          'ERROR: Invalid token symbol or address.',
          inReplyTo(message.message_id),
        );
        return;
      }
      
      const t2eTradeType = validateTradeType(args[2]);
      const e2tTradeType = validateTradeType(args[6]);

      if (t2eTradeType === undefined || e2tTradeType === undefined) {
        reply(
          'ERROR: Invalid trade type. Must be BestOfAll, MaskIn, MaskOut, or Split.',
          inReplyTo(message.message_id),
        );
        return;
      }

      try {
        let t2eReserveIds = JSON.parse(args[3]).map((e) => helpers.to32Bytes(e));
        let t2eSplits = JSON.parse(args[4]).map((e) => helpers.to32Bytes(e));
        let e2tReserveIds = JSON.parse(args[7]).map((e) => helpers.to32Bytes(e));
        let e2tSplits = JSON.parse(args[8]).map((e) => helpers.to32Bytes(e));

        buildHintArgs = [
          t2eTokenSrc.address,
          t2eTradeType,
          t2eReserveIds,
          t2eSplits,
          e2tTokenDest.address,
          e2tTradeType,
          e2tReserveIds,
          e2tSplits,
        ];
      } catch (e) {
        reply(
          'ERROR: Invalid input in reserveIds or splits array.',
          inReplyTo(message.message_id),
        );
        return;
      }
    }

    try {
      const result = await buildHint(...buildHintArgs);

      let msg ='';
      msg = msg.concat(
        `${tradePath.toUpperCase()} Hint: \`${result}\``,
      );
      
      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.message, inReplyTo(message.message_id));
    }
  };
};
