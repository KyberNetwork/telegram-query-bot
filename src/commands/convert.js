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
    let qty = args[0];
    let srcToken = args[1].toUpperCase();
    let destToken = args[2].toUpperCase();
    let result;

    srcToken = currencies.find(o => o.symbol === srcToken);
    destToken = currencies.find(o => o.symbol === destToken);

    if (!srcToken || !destToken) {
      reply('Invalid source or destination token symbol.', inReplyTo(message.message_id));
      return;
    }

    if (srcToken.symbol === 'ETH') {
      result = (await axios.get('/buy_rate', {
        params: {
          id: destToken.address,
          qty: qty,
        }
      })).data;

      if (result.error) {
        reply('Conversion for the pair is unavailable.');
        return;
      }

      result = (qty ** 2) / result.data[0].src_qty[0];
    } else if (destToken.symbol === 'ETH') {
      result = (await axios.get('/sell_rate', {
        params: {
          id: srcToken.address,
          qty: qty,
        }
      })).data;

      if (result.error) {
        reply('Conversion for the pair is unavailable.');
        return;
      }

      result = result.data[0].dst_qty[0];
    } else {
      let src = (await axios.get('/sell_rate', {
        params: {
          id: srcToken.address,
          qty,
        }
      })).data;

      let dest = (await axios.get('/sell_rate', {
        params: {
          id: destToken.address,
          qty,
        }
      })).data;

      if (src.error || dest.error) {
        reply('Conversion for the pair is unavailable.');
        return;
      }

      src = src.data[0].dst_qty[0] / qty;
      dest = dest.data[0].dst_qty[0] / qty;

      result = (src / dest) * qty;
    }

    replyWithMarkdown(`*${qty} ${srcToken.symbol} => ${result} ${destToken.symbol}*`, inReplyTo(message.message_id));
  };
};
