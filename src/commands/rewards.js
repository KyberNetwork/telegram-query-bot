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

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id)
      );
      return;
    }

    const network = args[1] ? args[1].toLowerCase() : 'mainnet';
    const epoch = args[0];
    const rewardsPerEpoch = helpers.getFeeHandlerFunction(
      network,
      'rewardsPerEpoch'
    );
    const rewardsPaidPerEpoch = helpers.getFeeHandlerFunction(
      network,
      'rewardsPaidPerEpoch'
    );

    let msg = '';
    msg = msg.concat(
      `Rewards for Epoch ${epoch}: \`${helpers.toHumanWei(
        await rewardsPerEpoch(epoch)
      )} ETH\`\n`,
      `Rewards Paid for Epoch ${epoch}: \`${helpers.toHumanWei(
        await rewardsPaidPerEpoch(epoch)
      )} ETH\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
