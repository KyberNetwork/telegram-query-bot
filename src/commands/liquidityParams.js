const Extra = require('telegraf/extra');

function checkRequiredArgs(args) {
  const required = [
    'liquidity_rate',
    'initial_ether_amount',
    'initial_token_amount',
    'initial_price',
    'min_supported_price_factor',
    'max_supported_price_factor',
    'max_tx_buy_amount_eth',
    'max_tx_sell_amount_eth',
    'fee_percent',
    'formula_precision_bits',
  ];

  return required.filter(element => !args.includes(element));
}

function validateParams(args) {
  const min_supported_price = args['initial_price'] / Math.exp(args['liquidity_rate'] * args['initial_ether_amount']);
  const min_calculated_price_factor = min_supported_price / args['initial_price'];
  const warnings = [];
  let max_calculated_price_factor = 0;

  if ((args['liquidity_rate'] * args['initial_price'] * args['initial_token_amount']) < 1) {
    const max_supported_price = args['initial_price'] / (1 - args['liquidity_rate'] * args['initial_price'] * args['initial_token_amount']);
    max_calculated_price_factor = max_supported_price / args['initial_price'];
  }

  if (min_calculated_price_factor > args['min_supported_price_factor']) {
    warnings.push(`WARNING: min_calculated_price_factor ${min_calculated_price_factor} > min_supported_price_factor ${args['min_supported_price_factor']}`);
  }

  if (max_calculated_price_factor === 0) {
    warnings.push('WARNING: max_calculated_price_factor is big and cannot be calculated. initial_token_amount can be decreased to avoid this.');
  } else if (max_calculated_price_factor < args['max_supported_price_factor']) {
    warnings.push(`WARNING: max_calculated_price_factor ${max_calculated_price_factor} > configured max_supported_price_factor ${args['max_supported_price_factor']}`);
  }

  const expected_initial_price = args['initial_price'] * args['min_supported_price_factor'] * Math.exp(args['liquidity_rate'] * args['initial_ether_amount']);
  const diff_percent = (expected_initial_price === args['initial_price']) ? 0 : (Math.abs(expected_initial_price - args['initial_price']) / expected_initial_price) * 100.0;
  if (diff_percent > 1.0) {
    warnings.push(`WARNING: expected_initial_price ${expected_initial_price} different from initial_price ${args['initial_price']} by ${diff_percent}%`);
  }

  return (warnings.length > 0) ? warnings : '';
}

function getParams(args) {
  const result = [];
  const max_supported_price = args['max_supported_price_factor'] * args['initial_price'];
  const min_supported_price = args['min_supported_price_factor'] * args['initial_price'];

  const _rInFp = args['liquidity_rate'] * (2 ** args['formula_precision_bits']);
  result.push(`rInFp: \`${Math.floor(_rInFp)}\``);

  const _pMinInFp = min_supported_price * (2 ** args['formula_precision_bits']);
  result.push(`pMinInFp: \`${Math.floor(_pMinInFp)}\``);

  const _numFpBits = args['formula_precision_bits'];
  result.push(`numFpBits: \`${_numFpBits}\``);

  const _maxCapBuyInWei = args['max_tx_buy_amount_eth'] * (10 ** 18);
  result.push(`maxCapBuyInWei: \`${_maxCapBuyInWei}\``);

  const _maxCapSellInWei = args['max_tx_sell_amount_eth'] * (10 ** 18);
  result.push(`maxCapSellInWei: \`${_maxCapSellInWei}\``);

  const _feeInBps = args['fee_percent'] * 100;
  result.push(`feeInBps: \`${_feeInBps}\``);

  const _maxTokenToEthRateInPrecision = max_supported_price * (10 ** 18);
  result.push(`maxTokenToEthRateInPrecision: \`${_maxTokenToEthRateInPrecision}\``);

  const _minTokenToEthRateInPrecision = min_supported_price * (10 ** 18);
  result.push(`minTokenToEthRateInPrecision: \`${_minTokenToEthRateInPrecision}\``);

  return result;
}

module.exports = () => {
  return async ctx => {
    const { message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (Object.entries(args).length === 0 || args.length > 0) {
      reply('ERROR: Invalid JSON passed.', inReplyTo(sent.message_id));
      return;
    }

    const diff = checkRequiredArgs(Object.keys(args));
    if (diff.length !== 0) {
      reply(`ERROR: Invalid JSON passed. Missing the following: ${diff.join(', ')}`, inReplyTo(message.message_id));
      return;
    }

    const warnings = validateParams(args);
    const result = getParams(args);
    const sent = await replyWithMarkdown(result.join('\n'), inReplyTo(message.message_id));

    if (warnings) {
      reply(warnings.join('\n\n'), inReplyTo(sent.message_id));
    }
  };
};
