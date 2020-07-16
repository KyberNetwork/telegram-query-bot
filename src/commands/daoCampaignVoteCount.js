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
    const { ethers } = helpers.getEthLib(network);
    const campaignId = args[0];
    const getCampaignDetails = helpers.getDaoFunction(
      network,
      'getCampaignDetails'
    );
    const getBRRFromData = helpers.getDaoFunction(
      network,
      'getRebateAndRewardFromData'
    );
    const getCampaignVoteCountData = helpers.getDaoFunction(
      network,
      'getCampaignVoteCountData'
    );
    const campaignDetails = await getCampaignDetails(campaignId);
    const voteCountData = await getCampaignVoteCountData(campaignId);
    const options = [];
    const votes = [];

    let rr;
    for (let i = 0; i < campaignDetails.options.length; i++) {
      rr = await getBRRFromData(campaignDetails.options[i]);
      options.push({
        burn: ((10000 - rr.rewardInBps - rr.rebateInBps) / 10000) * 100,
        rewards: (rr.rewardInBps / 10000) * 100,
        rebates: (rr.rebateInBps / 10000) * 100,
      });

      votes.push(
        (voteCountData.voteCounts[i] / voteCountData.totalVoteCount) * 100
      );
    }

    let msg = '';
    msg = msg.concat(
      '*VOTE COUNTS*\n',
      `${options
        .map(
          (e, i) =>
            `${i}] burn: ${e.burn}%, rewards: ${e.rewards}%, rebates: ${e.rebates}% :\n\`${votes[i].toFixed(2)}% voted\``
        )
        .join('`\n`')}\n\n`,
      `Total Vote Count: \`${helpers.toHumanNum(
        ethers.utils.formatEther(voteCountData.totalVoteCount)
      )} points\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
