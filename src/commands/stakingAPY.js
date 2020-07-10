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
    const web3 = helpers.getWeb3(network);
    const { KyberStaking } = contracts[network];
    const kncAmount = args[0];
    const kncToken = helpers.getStakingFunction(network, 'kncToken');
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const KNC = new web3.eth.Contract(tokenABI, await kncToken().call());
    const epochPeriodInSeconds = helpers.getDaoFunction(network, 'epochPeriodInSeconds');
    const getCurrentEpochNumber = helpers.getStakingFunction(network, 'getCurrentEpochNumber');
    const rewardsPerEpoch = helpers.getFeeHandlerFunction(network, 'rewardsPerEpoch');
    const getExpectedRate = helpers.getProxyFunction(network, 'getExpectedRate');
    
    const currentEpoch = await getCurrentEpochNumber().call();
    const epoch = (currentEpoch === '0') ? 0 : currentEpoch - 1; // get previous epoch number
    const epochPeriod = (await epochPeriodInSeconds().call()) / 60 / 60 / 24; // convert seconds to days

    // Calculate rewards in last epoch
    const totalKNCStaked = await KNC.methods.balanceOf(KyberStaking._address).call();
    const totalRewards = await rewardsPerEpoch(epoch).call(); // total rewards in last epoch
    const rewardsLastEpoch = kncAmount / web3.utils.fromWei(totalKNCStaked) * web3.utils.fromWei(totalRewards);

    // Calculate APY
    const kncRate = await getExpectedRate(
      KNC._address,
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      web3.utils.toWei('1'),
    ).call();
    const stakingAPY = (rewardsLastEpoch / epochPeriod * 365) / (kncAmount * web3.utils.fromWei(kncRate.expectedRate)) * 100;

    let msg = '';
    msg = msg.concat(
      `*Estimated APY using epoch ${epoch}*\n`,
      `Total KNC staked: \`${web3.utils.fromWei(totalKNCStaked)} KNC\`\n`,
      `Total rewards at epoch ${epoch}: \`${web3.utils.fromWei(totalRewards)} ETH\`\n`,
      `Rewards per epoch: \`${rewardsLastEpoch / epochPeriod * 30} ETH\`\n`,
      `Rewards per year: \`${rewardsLastEpoch / epochPeriod * 365} ETH\`\n`,
      `APY: \`${stakingAPY}%\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
