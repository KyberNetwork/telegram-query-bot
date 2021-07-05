const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { message, reply, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 2) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 2 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const ascii = args[0];
    const reserveType = args[1];

    let type;
    switch (reserveType.toUpperCase()) {
      case 'FPR':
        type = 'ff';
        break;
      case 'APR':
        type = 'aa';
        break;
      case 'BRIDGE':
        type = 'bb';
        break;
      case 'CUSTOM':
        type = 'cc';
        break;
      case 'UTILITY':
        type = '00';
        break;
      default:
        type = '';
        break;
    }

    var result = [];
    let hex;
    for (let i = 0; i < ascii.length; i++)  {
      hex = ascii.charCodeAt(i).toString(16);
      result.push(hex);
    }
    result = `0x${type}${result.join('')}`;

    reply(result, inReplyTo(message.message_id));
  };
};
