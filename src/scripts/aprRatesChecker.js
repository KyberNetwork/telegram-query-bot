require('dotenv').config();

const CronJob = require('cron').CronJob;
const Extra = require('telegraf/extra');

const reserves = process.env.MONITOR_APR.split(',');

async function getBalances(
  reserveInstance,
  token,
  tokenInstance,
  tokenDecimals,
  provider,
  helpers
) {
  let tokenBalance;
  let tokenWallet;

  try {
    tokenWallet = await reserveInstance.tokenWallet(token);
    tokenBalance =
      (await tokenInstance.balanceOf(tokenWallet)) / 10 ** tokenDecimals;
  } catch (e) {
    tokenBalance =
      (await tokenInstance.balanceOf(reserveInstance.address)) /
      10 ** tokenDecimals;
  }

  return {
    eth_balance: helpers.toHumanWei(
      await provider.getBalance(reserveInstance.address)
    ),
    token_balance: helpers.toHumanNum(tokenBalance),
  };
}

async function getConversionRate(
  reserveInstance,
  tokenDecimals,
  type,
  eth,
  token,
  provider,
  ethers
) {
  const blockNumber = await provider.getBlockNumber();
  let src;
  let dest;
  let srcQty;

  if (type === 'e2t') {
    src = eth;
    dest = token;
    srcQty = ethers.utils.parseEther('1');
  } else {
    src = token;
    dest = eth;
    srcQty = 10 ** tokenDecimals;
  }

  return await reserveInstance.getConversionRate(
    src,
    dest,
    srcQty.toString(),
    blockNumber
  );
}

module.exports = async (app) => {
  const { helpers } = app.context;
  const { ethers, provider } = helpers.getEthLib('mainnet');

  const job = new CronJob(
    '0 0 4 * * *',
    async () => {
      const eth = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

      let getReserveAddresses;
      let reserveAddress;
      let reserveInstance;
      let pricingInstance;
      let token;
      let tokenInstance;
      let tokenDecimals;
      let inventories;

      let e2tRate;
      let t2eRate;
      let reserveAscii;
      let reserveType;
      let ctrBuy = 0;
      let ctrSell = 0;
      let msgBuy = '*NO BUY RATE*\n';
      let msgSell = '\n*NO SELL RATE*\n';
      let msgInventory = '\n*INVENTORIES*\n';
      let result = '';

      for (let index in reserves) {
        getReserveAddresses = helpers.getStorageFunction(
          'mainnet',
          'getReserveAddressesByReserveId'
        );
        reserveAddress = (
          await getReserveAddresses(helpers.to32Bytes(reserves[index]))
        )[0];
        reserveInstance = helpers.getReserveInstance('mainnet', reserveAddress);
        pricingInstance = helpers.getPricingInstance(
          'mainnet',
          await reserveInstance.conversionRatesContract(),
          'apr'
        );
        token = await pricingInstance.token();
        tokenInstance = helpers.getTokenInstance('mainnet', token);
        tokenDecimals = await tokenInstance.decimals();

        e2tRate = await getConversionRate(
          reserveInstance,
          tokenDecimals,
          'e2t',
          eth,
          token,
          provider,
          ethers
        );

        t2eRate = await getConversionRate(
          reserveInstance,
          tokenDecimals,
          't2e',
          eth,
          token,
          provider,
          ethers
        );

        [reserveAscii, reserveType] = helpers.reserveIdToAscii(reserves[index]);

        if (parseInt(e2tRate) === 0) {
          msgBuy = msgBuy.concat(
            `${index}] \`${reserves[index]}\` (${reserveAscii.replace(
              /_/g,
              '\\_'
            )} [[${reserveType}]])\n`
          );
          ctrBuy++;
        }

        if (parseInt(t2eRate) === 0) {
          msgSell = msgSell.concat(
            `${index}] \`${reserves[index]}\` (${reserveAscii.replace(
              /_/g,
              '\\_'
            )} [[${reserveType}]])\n`
          );
          ctrSell++;
        }

        if (parseInt(t2eRate) === 0 || parseInt(t2eRate) === 0) {
          inventories = await getBalances(
            reserveInstance,
            token,
            tokenInstance,
            tokenDecimals,
            provider,
            helpers
          );

          msgInventory = msgInventory.concat(
            `${index}] ${reserves[index]}\n\`ETH: ${
              inventories.eth_balance
            } ; ${await tokenInstance.symbol()}: ${inventories.token_balance}\`\n`
          );
        }
      }

      if (ctrBuy > 0) result = result.concat(msgBuy);
      if (ctrSell > 0) result = result.concat(msgSell);

      if (ctrBuy > 0 || ctrSell > 0) {
        await app.telegram.sendMessage(
          chat_id = process.env.MONITORING_CHAT,
          text = result.concat(msgInventory, '\n\n🆘 🆘 @shaneHk @e13sunny 🆘 🆘'),
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
