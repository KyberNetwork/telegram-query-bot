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

    const network = (args[0]) ? args[0].toLowerCase() : 'mainnet';
    const web3 = helpers.getWeb3(network);
    const { KyberStaking } = contracts[network];
    const kncToken = helpers.getStakingFunction(network, 'kncToken');
    const tokenABI = JSON.parse(fs.readFileSync('src/contracts/abi/ERC20.abi', 'utf8'));
    const KNC = new web3.eth.Contract(tokenABI, await kncToken().call());
    const result = web3.utils.fromWei(await KNC.methods.balanceOf(KyberStaking._address).call());
    
    replyWithMarkdown(`Total staked: \`${result} KNC\``, inReplyTo(message.message_id));
  };
};
