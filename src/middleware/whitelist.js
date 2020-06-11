require('dotenv').config();

const whitelist = process.env.WHITELIST.split(',');

module.exports = () => {
  return (ctx, next) => {
    ctx.state.allowed = whitelist.includes(ctx.message.from.username);

    return next();
  };
};
