const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (args.length !== 3) {
      reply(`ERROR: Invalid number of arguments. ${args.length} of 3 provided.`);
      return;
    }

    const currencies = (await axios.get('/currencies')).data.data;
    let srcToken = args[0].toUpperCase();
    let destToken = args[1].toUpperCase();
    let srcQty = args[2];
    let result;

    srcToken = currencies.find(o => o.symbol === srcToken);
    destToken = currencies.find(o => o.symbol === destToken);

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id), Extra.markdown());
      return;
    }

    if (srcToken.symbol === 'ETH') {
      result = (await axios.get('/buy_rate', {
        params: {
          id: destToken.address,
          qty: srcQty,
        }
      })).data;

      if (result.error) {
        reply('No rate returned.');
        return;
      }

      result = srcQty / result.data[0].src_qty[0];
    } else if (destToken.symbol === 'ETH') {
      result = (await axios.get('/sell_rate', {
        params: {
          id: srcToken.address,
          qty: srcQty,
        }
      })).data;

      if (result.error) {
        reply('No rate returned.');
        return;
      }

      result = result.data[0].dst_qty[0] / srcQty;
    } else {
      let src = (await axios.get('/sell_rate', {
        params: {
          id: srcToken.address,
          qty: srcQty,
        }
      })).data;

      let dest = (await axios.get('/sell_rate', {
        params: {
          id: destToken.address,
          qty: srcQty,
        }
      })).data;

      if (src.error || dest.error) {
        reply('No rate returned.');
        return;
      }

      src = src.data[0].dst_qty[0] / srcQty;
      dest = dest.data[0].dst_qty[0] / srcQty;
      result = src / dest;
    }

    replyWithMarkdown(`*${result}*`, inReplyTo(message.message_id));
  };
};
