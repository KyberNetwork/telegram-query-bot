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
    const web3 = helpers.getWeb3(network);
    const staker = args[0];
    const epoch = args[1];
    const getStakerData = helpers.getStakingFunction(network, 'getStakerData');

    try {
      const result = await getStakerData(staker, epoch).call();

      let msg = '';
      msg = msg.concat(
        `Stake: \`${web3.utils.fromWei(result.stake)} KNC\`\n`,
        `Delegated Stake: \`${result.delegatedStake} KNC\`\n`,
        `Representative: \`${result.representative}\``,
      );

      replyWithMarkdown(msg, inReplyTo(message.message_id));
    } catch (e) {
      replyWithMarkdown(e.message, inReplyTo(message.message_id));
    }
  };
};
