const Extra = require('telegraf/extra');
const fetch = require('node-fetch');

function checkRequiredArgs(args) {
  const required = ['reserve'];

  return required.filter((element) => !args.includes(element));
}

async function fetchParams(
  reserveAddress,
  args,
  ethers,
  network,
  provider,
  helpers
) {
  const reserveInstance = helpers.getReserveInstance(network, reserveAddress);
  const pricingInstance = helpers.getPricingInstance(
    network,
    await reserveInstance.conversionRatesContract(),
    'apr'
  );
  const tokenAddress = await pricingInstance.token();
  const tokenInstance = helpers.getTokenInstance(network, tokenAddress);
  const tokenDecimals = await tokenInstance.decimals();

  // read from conversion rates contract
  let numFpBits = (await pricingInstance.numFpBits()).toNumber();
  let maxEthCapBuy =
    (await pricingInstance.maxEthCapBuyInFp()) / 2 ** numFpBits;
  maxEthCapBuy = maxEthCapBuy == 0 ? 5 : maxEthCapBuy;
  let maxEthCapSell =
    (await pricingInstance.maxEthCapSellInFp()) / 2 ** numFpBits;
  maxEthCapSell = maxEthCapSell == 0 ? 5 : maxEthCapSell;
  let feeInBps = await pricingInstance.feeInBps();
  feeInBps = feeInBps.eq(ethers.constants.Zero) ? 0.05 : feeInBps / 100;
  let initialPrice = await fetchTokenPrice(tokenAddress);
  initialPrice = initialPrice == 0 ? 1000 : initialPrice;

  // set defualt params if needed
  args['min_supported_price_factor'] = args['min_supported_price_factor']
    ? args['min_supported_price_factor']
    : 0.5;
  args['max_supported_price_factor'] = args['max_supported_price_factor']
    ? args['max_supported_price_factor']
    : 2.0;
  args['max_tx_buy_amount_eth'] = args['max_tx_buy_amount_eth']
    ? args['max_tx_buy_amount_eth']
    : maxEthCapBuy;
  args['max_tx_sell_amount_eth'] = args['max_tx_sell_amount_eth']
    ? args['max_tx_sell_amount_eth']
    : maxEthCapSell;
  args['fee_percent'] = args['fee_percent'] ? args['fee_percent'] : feeInBps;
  args['formula_precision_bits'] = args['formula_precision_bits']
    ? args['formula_precision_bits']
    : numFpBits;
  args['initial_price'] = args['initial_price']
    ? args['initial_price']
    : initialPrice;

  // get ether balance
  args['initial_ether_amount'] = args['initial_ether_amount']
    ? args['initial_ether_amount']
    : ethers.utils.formatEther(await provider.getBalance(reserveAddress));

  // liquidity rate
  args['liquidity_rate'] =
    Math.log(1 / args['min_supported_price_factor']) /
    args['initial_ether_amount'];

  // if token amount set already, can continue
  if (args['initial_token_amount']) return args;

  // otherwise get token balance
  try {
    const tokenWallet = await reserveInstance.tokenWallet(tokenAddress);
    args['initial_token_amount'] =
      (await tokenInstance.balanceOf(tokenWallet)) / 10 ** tokenDecimals;
  } catch (e) {
    args['initial_token_amount'] =
      (await tokenInstance.balanceOf(reserveAddress)) / 10 ** tokenDecimals;
  }

  return args;
}

async function fetchTokenPrice(tokenAddress) {
  let priceRequest = await fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=eth`
  );
  let result = Object.values(await priceRequest.json());
  if (!result.length) {
    return 0;
  } else {
    return result[0].eth;
  }
}

function validateParams(args) {
  const min_supported_price =
    args['initial_price'] /
    Math.exp(args['liquidity_rate'] * args['initial_ether_amount']);
  const min_calculated_price_factor =
    min_supported_price / args['initial_price'];
  const warnings = [];
  let max_calculated_price_factor = 0;

  if (
    args['liquidity_rate'] *
      args['initial_price'] *
      args['initial_token_amount'] <
    1
  ) {
    const max_supported_price =
      args['initial_price'] /
      (1 -
        args['liquidity_rate'] *
          args['initial_price'] *
          args['initial_token_amount']);
    max_calculated_price_factor = max_supported_price / args['initial_price'];
  }

  if (min_calculated_price_factor > args['min_supported_price_factor']) {
    warnings.push(
      `WARNING: min_calculated_price_factor ${min_calculated_price_factor} > min_supported_price_factor ${args['min_supported_price_factor']}`
    );
  }

  if (max_calculated_price_factor === 0) {
    warnings.push(
      'WARNING: max_calculated_price_factor is big and cannot be calculated. initial_token_amount can be decreased to avoid this.'
    );
  } else if (max_calculated_price_factor < args['max_supported_price_factor']) {
    warnings.push(
      `WARNING: max_calculated_price_factor ${max_calculated_price_factor} > configured max_supported_price_factor ${args['max_supported_price_factor']}`
    );
  }

  const expected_initial_price =
    args['initial_price'] *
    args['min_supported_price_factor'] *
    Math.exp(args['liquidity_rate'] * args['initial_ether_amount']);
  const diff_percent =
    expected_initial_price === args['initial_price']
      ? 0
      : (Math.abs(expected_initial_price - args['initial_price']) /
          expected_initial_price) *
        100.0;
  if (diff_percent > 1.0) {
    warnings.push(
      `WARNING: expected_initial_price ${expected_initial_price} different from initial_price ${args['initial_price']} by ${diff_percent}%`
    );
  }

  return warnings.length > 0 ? warnings : '';
}

function getParams(args) {
  const result = [];
  const max_supported_price =
    args['max_supported_price_factor'] * args['initial_price'];
  const min_supported_price =
    args['min_supported_price_factor'] * args['initial_price'];

  result.push('*LIQUIDITY PARAMS*');

  const _rInFp = args['liquidity_rate'] * 2 ** args['formula_precision_bits'];
  result.push(`\\_rInFp: \`${Math.floor(_rInFp)}\``);

  const _pMinInFp = min_supported_price * 2 ** args['formula_precision_bits'];
  result.push(`\\_pMinInFp: \`${Math.floor(_pMinInFp)}\``);

  const _numFpBits = args['formula_precision_bits'];
  result.push(`\\_numFpBits: \`${_numFpBits}\``);

  const _maxCapBuyInWei = args['max_tx_buy_amount_eth'] * 10 ** 18;
  result.push(`\\_maxCapBuyInWei: \`${_maxCapBuyInWei}\``);

  const _maxCapSellInWei = args['max_tx_sell_amount_eth'] * 10 ** 18;
  result.push(`\\_maxCapSellInWei: \`${_maxCapSellInWei}\``);

  const _feeInBps = args['fee_percent'] * 100;
  result.push(`\\_feeInBps: \`${_feeInBps}\``);

  const _maxTokenToEthRateInPrecision = max_supported_price * 10 ** 18;
  result.push(
    `\\_maxTokenToEthRateInPrecision: \`${_maxTokenToEthRateInPrecision}\``
  );

  const _minTokenToEthRateInPrecision = min_supported_price * 10 ** 18;
  result.push(
    `\\_minTokenToEthRateInPrecision: \`${_minTokenToEthRateInPrecision}\``
  );

  result.push('\n');

  result.push('*COMPUTED INPUTS*');
  result.push('{');
  result.push(`  "liquidity\\_rate": \`${args['liquidity_rate']}\`,`);
  result.push(
    `  "initial\\_ether\\_amount": \`${args['initial_ether_amount']}\`,`
  );
  result.push(
    `  "initial\\_token\\_amount": \`${args['initial_token_amount']}\`,`
  );
  result.push(`  "initial\\_price": \`${args['initial_price']}\`,`);
  result.push(
    `  "min\\_supported\\_price\\_factor": \`${args['min_supported_price_factor']}\`,`
  );
  result.push(
    `  "max\\_supported\\_price\\_factor": \`${args['max_supported_price_factor']}\`,`
  );
  result.push(
    `  "max\\_tx\\_buy\\_amount\\_eth": \`${args['max_tx_buy_amount_eth']}\`,`
  );
  result.push(
    `  "max\\_tx\\_sell\\_amount\\_eth": \`${args['max_tx_sell_amount_eth']}\`,`
  );
  result.push(`  "fee\\_percent": \`${args['fee_percent']}\`,`);
  result.push(
    `  "formula\\_precision\\_bits": \`${args['formula_precision_bits']}\``
  );
  result.push('}');

  return result;
}

module.exports = () => {
  return async (ctx) => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply(
        'You are not whitelisted to use this bot',
        inReplyTo(message.message_id)
      );
      return;
    }

    if (Object.entries(args).length === 0 || args.length > 0) {
      reply('ERROR: Invalid JSON passed.', inReplyTo(sent.message_id));
      return;
    }

    const network = args['network'] ? args['network'].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);

    const diff = checkRequiredArgs(Object.keys(args));
    if (diff.length !== 0) {
      reply(
        `ERROR: Invalid JSON passed. Missing the following: ${diff.join(', ')}`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let reserveAddress;
    if (!ethers.utils.isAddress(args['reserve'])) {
      let getReserveInfo = helpers.getStorageFunction(
        network,
        'getReserveDetailsById'
      );
      reserveAddress = (
        await getReserveInfo(helpers.to32Bytes(args['reserve']))
      ).reserveAddress;
    } else {
      reserveAddress = args['reserve'];
    }

    let finalArgs = await fetchParams(
      reserveAddress,
      args,
      ethers,
      network,
      provider,
      helpers
    );
    const warnings = validateParams(finalArgs);
    const result = getParams(finalArgs);
    const sent = await replyWithMarkdown(
      result.join('\n'),
      inReplyTo(message.message_id)
    );

    if (warnings) {
      reply(warnings.join('\n\n'), inReplyTo(sent.message_id));
    }
  };
};
