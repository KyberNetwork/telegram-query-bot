require('dotenv').config();

const CronJob = require('cron').CronJob;
const Extra = require('telegraf/extra');

module.exports = async (app) => {
  const { axios, helpers } = app.context;
  const { provider } = helpers.getEthLib('mainnet');
  const { etherscan } = axios;

  const job = new CronJob(
    '0 0 */2 * * *', // seconds minutes hours DoM months DoW
    async () => {
      const sanityContract = '0xA2D951a22d5c0256FC2daeE7e2B3EDE75ebFa22D';
      const latestBlock = await provider.getBlockNumber();

      const txs = (
        await etherscan.get(
          `api?module=account&action=txlist&address=${sanityContract}&page=1&sort=desc&apikey=${process.env.ETHERSCAN_KEY}`
        )
      ).data.result;
      const sanityBlock = parseInt(txs[0].blockNumber);
      const blockDiff = latestBlock - sanityBlock;

      let msg = '';
      if (blockDiff > 720) {
        msg = msg.concat(
          `Block Diff: \`${blockDiff}\`\n\n`,
          'Please check Sanity: https://etherscan.io/address/0xa2d951a22d5c0256fc2daee7e2b3ede75ebfa22d'
        );

        await app.telegram.sendMessage(
          chat_id = process.env.MONITORING_CHAT,
          text = msg,
          Extra.markdown()
        );
      }
    },
    null,
    true,
    'Asia/Singapore'
  );

  job.start();
};
