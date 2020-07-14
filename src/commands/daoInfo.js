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
    const epochPeriodInSeconds = helpers.getDaoFunction(
      network,
      'epochPeriodInSeconds'
    );
    const maxEpochCampaigns = helpers.getDaoFunction(
      network,
      'MAX_EPOCH_CAMPAIGNS'
    );
    const maxCampaignOptions = helpers.getDaoFunction(
      network,
      'MAX_CAMPAIGN_OPTIONS'
    );
    const minCampaignDuration = helpers.getDaoFunction(
      network,
      'minCampaignDurationInSeconds'
    );
    const latestCampaignID = helpers.getDaoFunction(network, 'numberCampaigns');
    const getCurrentEpoch = helpers.getDaoFunction(
      network,
      'getCurrentEpochNumber'
    );
    const firstEpochStart = helpers.getDaoFunction(
      network,
      'firstEpochStartTimestamp'
    );

    const epochPeriod = await epochPeriodInSeconds();
    const currentEpoch = await getCurrentEpoch();
    let nextEpochTimestamp = (await firstEpochStart()).add(
      epochPeriod.mul(currentEpoch)
    );
    nextEpochTimestamp = helpers.formatTime(nextEpochTimestamp);

    let msg = '';
    msg = msg.concat(
      `Current Epoch: \`${currentEpoch}\`\n`,
      `Latest Campaign ID: \`${await latestCampaignID()}\`\n`,
      `Next Epoch: \`${nextEpochTimestamp}\`\n`,
      `Epoch Period: \`${(epochPeriod / 60 / 60 / 24).toFixed(3)} days\`\n`, // convert seconds to days
      `Max Epoch Campaigns: \`${await maxEpochCampaigns()}\`\n`,
      `Max Campaign Options: \`${await maxCampaignOptions()}\`\n`,
      `Min Campaign Duration: \`${(
        (await minCampaignDuration()) /
        60 /
        60 /
        24
      ).toFixed(3)} days\`\n`
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
