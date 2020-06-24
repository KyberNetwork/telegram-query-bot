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
    const reserve = args[0];
    const reserveABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberReserve.abi', 'utf8'));
    const reserveInstance = new web3.eth.Contract(reserveABI, reserve);

    const admin = await reserveInstance.methods.admin().call();
    const pendingAdmin = await reserveInstance.methods.pendingAdmin().call();
    const alerters = await reserveInstance.methods.getAlerters().call();
    const operators = await reserveInstance.methods.getOperators().call();

    let msg ='';
    msg = msg.concat(
      `admin: \`${admin}\`\n`,
      `pendingAdmin: \`${pendingAdmin}\`\n`,
      `alerters: \`${alerters.join(', ')}\`\n`,
      `operators: \`${operators.join(', ')}\``,
    );
    
    replyWithMarkdown(msg, inReplyTo(message.message_id));
  };
};
