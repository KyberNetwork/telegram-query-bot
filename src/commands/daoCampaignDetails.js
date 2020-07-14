const Extra = require('telegraf/extra');

function validateCampaignType(type) {
  switch (type) {
    case 0:
      return 'General';
    case 1:
      return 'Network Fee';
    case 2:
      return 'BRR';
    default:
      return 'General';
  }
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
    const result = await getCampaignDetails(campaignId);
    const options = [];

    let rr;
    for (let i = 0; i < result.options.length; i++) {
      rr = await getBRRFromData(result.options[i]);
      options.push({
        burn: (10000 - rr.rewardInBps - rr.rebateInBps) / 10000 * 100,
        rewards: rr.rewardInBps / 10000 * 100,
        rebates: rr.rebateInBps / 10000 * 100,
      });
    }

    let msg = '';
    msg = msg.concat(
      `Campaign Type: \`${validateCampaignType(result.campaignType)}\`\n`,
      `Start TimeStamp: \`${helpers.formatTime(result.startTimestamp)}\`\n`,
      `End TimeStamp: \`${helpers.formatTime(result.endTimestamp)}\`\n`,
      `Total KNC Supply: \`${helpers.toHumanNum(
        ethers.utils.formatEther(result.totalKNCSupply)
      )}\`\n`,
      `Min Percentage: \`${result.minPercentageInPrecision / 10000000000000000}%\`\n`,
      `C: \`${result.cInPrecision}\`\n`,
      `T: \`${result.tInPrecision}\`\n`,
      `Link: ${helpers.hexToAscii(
        result.link.substr(2, result.link.length)
      )}\n`,
      `Options:\n\`${options
        .map(
          (e, i) =>
            `${i}] burn:${e.burn}%, rewards:${e.rewards}%, rebates:${e.rebates}%`
        )
        .join('`\n`')}\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
