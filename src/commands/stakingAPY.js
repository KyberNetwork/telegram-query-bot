const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async (ctx) => {
    const {
      helpers,
      message,
      reply,
      replyWithMarkdown,
      state,
    } = ctx;
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

    let numEpochs = 1;
    let network;
    if (args[1]) {
      if (
        ['mainnet', 'staging', 'ropsten', 'kovan', 'rinkeby'].includes(args[1].toLowerCase())
      ) {
        network = args[1].toLowerCase();
      } else {
        numEpochs = args[1];
        network = args[2] ? args[2].toLowerCase() : 'mainnet';
      }
    } else {
      network = 'mainnet';
    }
    const { ethers } = helpers.getEthLib(network);
    const BN = ethers.BigNumber;
    const PRECISION = ethers.constants.WeiPerEther;
    const kncAmount = ethers.utils.parseEther(args[0]);
    const kncToken = helpers.getStakingFunction(network, 'kncToken');
    const kncAddress = await kncToken();

    const epochPeriodInSeconds = helpers.getDaoFunction(
      network,
      'epochPeriodInSeconds'
    );
    const getListCampaignIds = helpers.getDaoFunction(
      network,
      'getListCampaignIDs'
    );
    const getTotalPts = helpers.getDaoFunction(
      network,
      'getTotalEpochPoints'
    );
    const getCurrentEpochNumber = helpers.getStakingFunction(
      network,
      'getCurrentEpochNumber'
    );
    const rewardsPerEpoch = helpers.getFeeHandlerFunction(
      network,
      'rewardsPerEpoch'
    );
    const getExpectedRate = helpers.getProxyFunction(
      network,
      'getExpectedRate'
    );

    const currentEpoch = (await getCurrentEpochNumber()).toNumber();
    // convert seconds to days
    const epochPeriod =
      (await epochPeriodInSeconds()).toNumber() / 60 / 60 / 24;

    let totalRewards = ethers.constants.Zero;
    // get average reward amt for numEpochs (excludes current epoch)
    for (let i = 1; i <= numEpochs; i++) {
      let epoch = Math.max(currentEpoch - i, 0);
      let epochRewards = await rewardsPerEpoch(epoch);
      epochRewards = (epoch == 0)
        ? epochRewards.mul(ethers.constants.Two)
        : epochRewards;
      totalRewards = totalRewards.add(epochRewards);
    }
    let averageRewards = totalRewards.div(BN.from(numEpochs));

    // Get number of campaigns and votes from Dao for current epoch
    const numCampaigns = BN.from((await getListCampaignIds(currentEpoch)).length);
    const totalPts = await getTotalPts(currentEpoch);

    // Calculate reward percentage, assuming user has voted for all campaigns
    let stakerRewardPercentPrecision = numCampaigns
      .mul(kncAmount)
      .mul(PRECISION)
      .div(totalPts);

    if (stakerRewardPercentPrecision.gt(PRECISION)) {
      reply(
        `KNC amount too high. Should be smaller than ${helpers.toHumanWei(totalPts)}`,
        inReplyTo(message.message_id)
      );
      return;
    }

    let stakerRewards = stakerRewardPercentPrecision
      .mul(averageRewards)
      .div(PRECISION);

    // Fetch rate, calculate ETH equivalent
    const kncRate = (
      await getExpectedRate(
        kncAddress,
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        ethers.constants.WeiPerEther
      )
    ).expectedRate;

    const currentEthAmount = kncAmount
      .mul(kncRate)
      .div(ethers.constants.WeiPerEther);
    
    // Finally, calculate stakingAPY
    const stakingAPY = (
      (((Number(stakerRewards) / epochPeriod) * 365) /
        Number(currentEthAmount)) *
      100
    ).toFixed(3);

    let msg = '';
    msg = msg.concat(
      `*Estimated APY*\n`,
      `Current epoch pts: \`${helpers.toHumanWei(totalPts)}\`\n`,
      `Current epoch reward: \`${helpers.toHumanWei(
        await rewardsPerEpoch(currentEpoch)
      )} ETH\`\n`,
      `Average reward amt: \`${helpers.toHumanWei(
        averageRewards
      )} ETH\`\n`,
      `Rewards per month: \`${helpers.toHumanWei(
        (stakerRewards / epochPeriod) * 30
      )} ETH\`\n`,
      `Rewards per year: \`${helpers.toHumanWei(
        (stakerRewards / epochPeriod) * 365
      )} ETH\`\n`,
      `APY: \`${stakingAPY}%\``
    );

    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
