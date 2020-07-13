const Extra = require('telegraf/extra');

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

    const network = args[0] ? args[0].toLowerCase() : 'mainnet';
    const burnBlockInterval = helpers.getFeeHandlerFunction(
      network,
      'burnBlockInterval'
    );
    const lastBurnBlock = helpers.getFeeHandlerFunction(
      network,
      'lastBurnBlock'
    );
    const weiToBurn = helpers.getFeeHandlerFunction(network, 'weiToBurn');

    let msg = '';
    msg = msg.concat(
      `Burn Block Interval: \`${await burnBlockInterval()}\`\n`,
      `Last Burn Block: \`${await lastBurnBlock()}\`\n`,
      `ETH to Burn: \`${helpers.toHumanWei(await weiToBurn())} ETH\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
