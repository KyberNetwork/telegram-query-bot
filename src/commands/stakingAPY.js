const Extra = require('telegraf/extra');
const fs = require('fs');

module.exports = () => {
  return async ctx => {
    const { contracts, helpers, message, reply, replyWithMarkdown, state } = ctx;
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
    const {ethers: ethers, provider: provider} = helpers.getEthLib(network);
    const { KyberStaking } = contracts[network];
    const kncAmount = ethers.utils.parseEther(args[0]);
    const kncToken = helpers.getStakingFunction(network, 'kncToken');
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const KNC = new ethers.Contract(await kncToken(), tokenABI, provider);
    const epochPeriodInSeconds = helpers.getDaoFunction(network, 'epochPeriodInSeconds');
    const getCurrentEpochNumber = helpers.getStakingFunction(network, 'getCurrentEpochNumber');
    const rewardsPerEpoch = helpers.getFeeHandlerFunction(network, 'rewardsPerEpoch');
    const getExpectedRate = helpers.getProxyFunction(network, 'getExpectedRate');
    
    const currentEpoch = await getCurrentEpochNumber();
    const epoch = (currentEpoch.eq(ethers.constants.Zero)) ? 0 : currentEpoch - 1; // get previous epoch number
    const epochPeriod = (await epochPeriodInSeconds()).toNumber() / 60 / 60 / 24; // convert seconds to days

    // Calculate rewards in last epoch
    const totalKNCStaked = await KNC.balanceOf(KyberStaking.address);
    const totalRewards = await rewardsPerEpoch(epoch); // total rewards in last epoch
    const stakerRewards = kncAmount.mul(totalRewards).div(totalKNCStaked.add(kncAmount));

    // Calculate APY
    let kncRate = (await getExpectedRate(
      KNC.address,
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      ethers.constants.WeiPerEther,
    )).expectedRate;

    let currentEthAmount = kncAmount.mul(kncRate).div(ethers.constants.WeiPerEther);
    const stakingAPY = ((Number(stakerRewards) / epochPeriod * 365) / Number(currentEthAmount) * 100).toFixed(3);

    let msg = '';
    msg = msg.concat(
      `*Estimated APY using epoch ${epoch}*\n`,
      `Total KNC staked: \`${helpers.getReadableWei(totalKNCStaked)} KNC\`\n`,
      `Total rewards at epoch ${epoch}: \`${helpers.getReadableWei(totalRewards)} ETH\`\n`,
      `Rewards per month: \`${helpers.getReadableWei(stakerRewards / epochPeriod * 30)} ETH\`\n`,
      `Rewards per year: \`${helpers.getReadableWei(stakerRewards / epochPeriod * 365)} ETH\`\n`,
      `APY: \`${stakingAPY}%\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
