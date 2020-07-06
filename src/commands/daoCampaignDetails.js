const Extra = require('telegraf/extra');

function validateCampaignType(type) {
  switch (type) {
    case '0':
      return 'General';
    case '1':
      return 'NetworkFee';
    case '2':
      return 'FeeHandlerBRR';
    default:
      return 'General';
  }
}

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const campaignId = args[0];
    const getCampaignDetails = helpers.getDaoFunction(network, 'getCampaignDetails');
    const result = await getCampaignDetails(campaignId).call();

    let msg = '';
    msg = msg.concat(
      `Campaign Type: \`${validateCampaignType(result.campaignType)}\`\n`,
      `Start TimeStamp: \`${helpers.formatTime(result.startTimeStamp)}\`\n`,
      `End TimeStamp: \`${helpers.formatTime(result.endTimeStamp)}\`\n`,
      `Total KNC Supply: \`${web3.utils.fromWei(result.totalKNCSupply)}\`\n`,
      `Min Percentage: \`${result.minPercentageInPrecision}\`\n`,
      `C: \`${result.cInPrecision}\`\n`,
      `T: \`${result.tInPrecision}\`\n`,
      `Link: \`${result.link}\`\n`,
      `Options: \`${result.options.join('`, `')}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
