const Extra = require('telegraf/extra');
const fs = require('fs');

function checkRequiredArgs(args) {
  const required = [
    'initial_price',
    'reserve'
  ];

  return required.filter(element => !args.includes(element));
}

async function fetchParams(args, ethers, provider) {
  const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
  const pricingABI = JSON.parse(fs.readFileSync('src/contracts/abi/LiquidityConversionRates.abi', 'utf8'));
  const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
  const reserveInstance = new ethers.Contract(args['reserve'], reserveABI, provider);
  const pricingInstance = new ethers.Contract(await reserveInstance.conversionRatesContract(), pricingABI, provider);
  const tokenAddress = await pricingInstance.token();
  const tokenInstance = new ethers.Contract(tokenAddress, tokenABI, provider);
  const tokenDecimals = await tokenInstance.decimals();

  // set defualt params if needed
  args['min_supported_price_factor'] = args['min_supported_price_factor'] ? args['min_supported_price_factor'] : 0.5;
  args['max_supported_price_factor'] = args['max_supported_price_factor'] ? args['max_supported_price_factor'] : 2.0;
  args['max_tx_buy_amount_eth'] = args['max_tx_buy_amount_eth'] ? args['max_tx_buy_amount_eth'] : 5;
  args['max_tx_sell_amount_eth'] = args['max_tx_sell_amount_eth'] ? args['max_tx_sell_amount_eth'] : 5;
  args['fee_percent'] = args['fee_percent'] ? args['fee_percent'] : 0.05;
  args['formula_precision_bits'] = args['formula_precision_bits'] ? args['formula_precision_bits'] : 40;

  // get ether balance
  args['initial_ether_amount'] = args['initial_ether_amount'] ?
    args['initial_ether_amount'] :
    ethers.utils.formatEther(await provider.getBalance(args['reserve']));

  // liquidity rate
  args['liquidity_rate'] = Math.log(1 / args['min_supported_price_factor']) / args['initial_ether_amount'];

  // if token amount set already, can continue
  if (args['initial_token_amount']) return args;

  // otherwise get token balance
  try {
    const tokenWallet = await reserveInstance.tokenWallet(tokenAddress);
    args['initial_token_amount'] = (await tokenInstance.balanceOf(tokenWallet)) / (10 ** tokenDecimals);
  } catch (e) {
    args['initial_token_amount'] = (await tokenInstance.balanceOf(args['reserve'])) / (10 ** tokenDecimals);
  }

  return args;
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

  result.push('*LIQUIDITY PARAMS*');

  const _rInFp = args['liquidity_rate'] * (2 ** args['formula_precision_bits']);
  result.push(`\\_rInFp: \`${Math.floor(_rInFp)}\``);

  const _pMinInFp = min_supported_price * (2 ** args['formula_precision_bits']);
  result.push(`\\_pMinInFp: \`${Math.floor(_pMinInFp)}\``);

  const _numFpBits = args['formula_precision_bits'];
  result.push(`\\_numFpBits: \`${_numFpBits}\``);

  const _maxCapBuyInWei = args['max_tx_buy_amount_eth'] * (10 ** 18);
  result.push(`\\_maxCapBuyInWei: \`${_maxCapBuyInWei}\``);

  const _maxCapSellInWei = args['max_tx_sell_amount_eth'] * (10 ** 18);
  result.push(`\\_maxCapSellInWei: \`${_maxCapSellInWei}\``);

  const _feeInBps = args['fee_percent'] * 100;
  result.push(`\\_feeInBps: \`${_feeInBps}\``);

  const _maxTokenToEthRateInPrecision = max_supported_price * (10 ** 18);
  result.push(`\\_maxTokenToEthRateInPrecision: \`${_maxTokenToEthRateInPrecision}\``);

  const _minTokenToEthRateInPrecision = min_supported_price * (10 ** 18);
  result.push(`\\_minTokenToEthRateInPrecision: \`${_minTokenToEthRateInPrecision}\``);

  result.push('\n');

  result.push('*COMPUTED INPUTS*');
  result.push(`liquidity\\_rate: \`${args['liquidity_rate']}\``);
  result.push(`initial\\_ether\\_amount: \`${args['initial_ether_amount']}\``);
  result.push(`initial\\_token\\_amount: \`${args['initial_token_amount']}\``);
  result.push(`initial\\_price: \`${args['initial_price']}\``);
  result.push(`min\\_supported\\_price\\_factor: \`${args['min_supported_price_factor']}\``);
  result.push(`max\\_supported\\_price\\_factor: \`${args['max_supported_price_factor']}\``);
  result.push(`max\\_tx\\_buy\\_amount\\_eth: \`${args['max_tx_buy_amount_eth']}\``);
  result.push(`max\\_tx\\_sell\\_amount\\_eth: \`${args['max_tx_sell_amount_eth']}\``);
  result.push(`fees\\_percent: \`${args['fee_percent']}\``);
  result.push(`formula\\_precision\\_bits: \`${args['formula_precision_bits']}\``);

  return result;
}

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    // let a = [];
    // a.push(`liquidity\\_rate: ${'__1__'}`);
    // replyWithMarkdown(`${a.join(' ')}`, inReplyTo(message.message_id));
    // return;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (Object.entries(args).length === 0 || args.length > 0) {
      reply('ERROR: Invalid JSON passed.', inReplyTo(sent.message_id));
      return;
    }

    const network = (args['network']) ? args['network'].toLowerCase() : 'mainnet';
    const { ethers, provider } = helpers.getEthLib(network);

    const diff = checkRequiredArgs(Object.keys(args));
    if (diff.length !== 0) {
      reply(`ERROR: Invalid JSON passed. Missing the following: ${diff.join(', ')}`, inReplyTo(message.message_id));
      return;
    }

    let finalArgs = await fetchParams(args, ethers, provider);
    const warnings = validateParams(finalArgs);
    const result = getParams(finalArgs);
    const sent = await replyWithMarkdown(result.join('\n'), inReplyTo(message.message_id));

    if (warnings) {
      reply(warnings.join('\n\n'), inReplyTo(sent.message_id));
    }
  };
};
