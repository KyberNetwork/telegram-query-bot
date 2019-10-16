const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { contracts, message, reply, replyWithMarkdown, state, web3 } = ctx;
    const { inReplyTo } = Extra;
    const { KyberNetworkStaging, KyberReserve } = contracts;
    const { args } = state.command;
    let result;

    if (args.length === 1) {
      reply('ERROR: No function provided.');
      return;
    }

    switch (args[0].toLowerCase()) {
    case 'addreserve':
      if (args.length-1 !== 2) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 2 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.addReserve(args[1], JSON.parse(args[2])).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    case 'listpairforreserve':
      if (args.length-1 !== 5) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 5 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.listPairForReserve(
          args[1],
          args[2],
          JSON.parse(args[3]),
          JSON.parse(args[4]),
          JSON.parse(args[5]),
        ).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    case 'removereserve':
      if (args.length-1 !== 2) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 2 provided.`);
        return;
      }

      try {
        result = await KyberNetworkStaging.methods.removeReserve(args[1], args[2]).encodeABI();
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    case 'approvewithdrawaddress':
      const account = web3.eth.accounts.privateKeyToAccount('0xfcbe1f277e55194746d35dc1981c67eaad96d4bd68cc859d7c69eca345b77a71');
      
      if (args.length-1 !== 3) {
        reply(`ERROR: Invalid number of arguments. ${args.length-1} of 3 provided.`);
        return;
      }

      try {
        const txObject = KyberReserve.methods.approveWithdrawAddress(args[1], args[2], args[3]);
        const nonce = 14;
        const txData = txObject.encodeABI();
        const txFrom = account.address;
        const txTo = '0x0dFB149316f04B022F86095c864e1265b1c0Eb5F';
        const txValue = 0;
        const txKey = account.privateKey;
        let gas_limit;
      
        try {
          gas_limit = 1600000;
        } catch (e) {
          gas_limit = 100000;
        }
      
        const txParams = {
          from: txFrom,
          to: txTo,
          data: txData,
          value: txValue,
          gas: gas_limit,
          gasPrice: 20000000000,
          nonce: nonce
        };
        
        result = await web3.eth.accounts.signTransaction(txParams, txKey);
        console.log(result);
      } catch (e) {
        reply(`ERROR: ${e}`);
        return;
      }

      break;
    default:
      reply('ERROR: Function not found in repertoire.');
      return;
    }

    replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
  };
};
