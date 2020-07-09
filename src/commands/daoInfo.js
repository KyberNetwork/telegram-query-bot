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

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const epochPeriodInSeconds = helpers.getDaoFunction(network, 'epochPeriodInSeconds');
    const maxEpochCampaigns = helpers.getDaoFunction(network, 'MAX_EPOCH_CAMPAIGNS');
    const maxCampaignOptions = helpers.getDaoFunction(network, 'MAX_CAMPAIGN_OPTIONS');
    const minCampaignDuration = helpers.getDaoFunction(network, 'minCampaignDurationInSeconds');
    const latestCampaignID = helpers.getDaoFunction(network, 'numberCampaigns');
    const stakingContract = helpers.getDaoFunction(network, 'staking');
    
    let msg = '';
    msg = msg.concat(
      `Epoch Period: \`${(await epochPeriodInSeconds().call()) / 60 / 60 / 24} days\`\n`, // convert seconds to days
      `Max Epoch Campaigns: \`${await maxEpochCampaigns().call()}\`\n`,
      `Max Campaign Options: \`${await maxCampaignOptions().call()}\`\n`,
      `Min Campaign Duration: \`${(await minCampaignDuration().call()) / 60 / 60 / 24} days\`\n`,
      `Latest Campaign ID: \`${await latestCampaignID().call()}\`\n`,
      `Staking Contract: \`${await stakingContract().call()}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
