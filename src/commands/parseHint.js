const Extra = require('telegraf/extra');

function validateToken(token, network, currencies) {
  if (token.toUpperCase() === 'ETH') {
    return { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
  } else if (
    !token.startsWith('0x') &&
    ['mainnet', 'staging', 'ropsten'].indexOf(network) !== -1
  ) {
    return currencies.find((o) => o.symbol === token.toUpperCase());
  } else if (token.length === 42 && token.startsWith('0x')) {
    return { address: token };
  } else {
    return;
  }
}

function validateTradeType(tradeType) {
  switch (tradeType) {
    case 0:
      return 'BestOfAll';
    case 1:
      return 'MaskIn';
    case 2:
      return 'MaskOut';
    case 3:
      return 'Split';
    default:
      return;
  }
}

module.exports = () => {
  return async (ctx) => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id),
        inReplyTo(message.message_id)
      );
      return;
    }

    if (args.length == 0) {
      reply(
        'ERROR: Invalid number of arguments.',
        inReplyTo(message.message_id)
      );
      return;
    }

    const tradePath = args[0].toLowerCase();

    let func;
    let required;
    switch (tradePath) {
      case 't2e':
        func = 'parseTokenToEthHint';
        required = 3;
        break;
      case 'e2t':
        func = 'parseEthToTokenHint';
        required = 3;
        break;
      case 't2t':
        func = 'parseTokenToTokenHint';
        required = 4;
        break;
      default:
        reply(
          'ERROR: Invalid trade path. Must be t2e, e2t, or t2t.',
          inReplyTo(message.message_id)
        );
        return;
    }

    if (args.length < required) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required ${required} provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[required] ? args[required].toLowerCase() : 'mainnet';
    const currencies = (await kyber(network).get('/currencies')).data.data;
    const parseHint = helpers.getMatchingEngineFunction(network, func);

    let parseHintArgs = [];
    if (tradePath === 't2e' || tradePath === 'e2t') {
      const token = validateToken(args[1], network, currencies);
      const hint = args[2];

      if (!token) {
        reply(
          'ERROR: Invalid token symbol or address.',
          inReplyTo(message.message_id)
        );
        return;
      }

      parseHintArgs = [token.address, hint];
    } else {
      const t2eTokenSrc = validateToken(args[1], network, currencies);
      const e2tTokenDest = validateToken(args[2], network, currencies);
      const hint = args[3];

      if (!t2eTokenSrc || !e2tTokenDest) {
        reply(
          'ERROR: Invalid token symbol or address.',
          inReplyTo(message.message_id)
        );
        return;
      }

      parseHintArgs = [t2eTokenSrc.address, e2tTokenDest.address, hint];
    }

    try {
      const result = await parseHint(...parseHintArgs);

      let msg = '';
      if (tradePath === 't2e') {
        msg = msg.concat(
          `tokenToEthType: \`${validateTradeType(result.tokenToEthType)}\`\n`,
          `tokenToEthReserveIds: \`${result.tokenToEthReserveIds.join(
            '`, `'
          )}\`\n`,
          `tokenToEthAddresses: \`${result.tokenToEthAddresses.join(
            '`, `'
          )}\`\n`,
          `tokenToEthSplits: \`${result.tokenToEthSplits.join('`, `')}\`\n`
        );
      } else if (tradePath === 'e2t') {
        msg = msg.concat(
          `ethToTokenType: \`${validateTradeType(result.ethToTokenType)}\`\n`,
          `ethToTokenReserveIds: \`${result.ethToTokenReserveIds.join(
            '`, `'
          )}\`\n`,
          `ethToTokenAddresses: \`${result.ethToTokenAddresses.join(
            '`, `'
          )}\`\n`,
          `ethToTokenSplits: \`${result.ethToTokenSplits.join('`, `')}\`\n`
        );
      } else if (tradePath === 't2t') {
        msg = msg.concat(
          `tokenToEthType: \`${validateTradeType(result.tokenToEthType)}\`\n`,
          `tokenToEthReserveIds: \`${result.tokenToEthReserveIds.join(
            '`, `'
          )}\`\n`,
          `tokenToEthAddresses: \`${result.tokenToEthAddresses.join(
            '`, `'
          )}\`\n`,
          `tokenToEthSplits: \`${result.tokenToEthSplits.join('`, `')}\`\n`,
          `ethToTokenType: \`${validateTradeType(result.ethToTokenType)}\`\n`,
          `ethToTokenReserveIds: \`${result.ethToTokenReserveIds.join(
            '`, `'
          )}\`\n`,
          `ethToTokenAddresses: \`${result.ethToTokenAddresses.join(
            '`, `'
          )}\`\n`,
          `ethToTokenSplits: \`${result.ethToTokenSplits.join('`, `')}\`\n`
        );
      }

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.message, inReplyTo(message.message_id));
    }
  };
};
