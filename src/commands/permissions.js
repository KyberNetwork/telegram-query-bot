const Extra = require('telegraf/extra');
const fs = require('fs');

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
    const contract = args[0];
    const permissionsABI = JSON.parse(fs.readFileSync('src/contracts/abi/PermissionGroups.abi', 'utf8'));
    const contractInstance = new web3.eth.Contract(permissionsABI, contract);

    const admin = await contractInstance.methods.admin().call();
    const pendingAdmin = await contractInstance.methods.pendingAdmin().call();
    const alerters = await contractInstance.methods.getAlerters().call();
    const operators = await contractInstance.methods.getOperators().call();

    let msg ='';
    msg = msg.concat(
      `admin: \`${admin}\`\n`,
      `pendingAdmin: \`${pendingAdmin}\`\n`,
      `alerters: \`${alerters.join('`, `')}\`\n`,
      `operators: \`${operators.join('`, `')}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
