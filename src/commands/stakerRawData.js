const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
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

    const network = (args[2]) ? args[2].toLowerCase() : 'mainnet';
    const staker = args[0];
    const epoch = args[1];
    const getStakerRawData = helpers.getStakingFunction(network, 'getStakerRawData');

    try {
      const result = await getStakerRawData(staker, epoch);

      let msg = '';
      msg = msg.concat(
        `Stake: \`${helpers.getReadableWei(result.stake)} KNC\`\n`,
        `Delegated Stake: \`${helpers.getReadableWei(result.delegatedStake)} KNC\`\n`,
        `Representative: \`${result.representative}\``,
      );

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.message, inReplyTo(message.message_id));
    }
  };
};
