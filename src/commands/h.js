const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { message, reply, replyWithMarkdown, state } = ctx;
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

    let type = args[0].toLowerCase();
    let help = '';
    switch (type) {
      case 'network':
        help = help.concat(
          '**NETWORK**\n',
          '=========\n',
          '`Returns the convertion of the source token to the destination token given a quantity`\n',
          '/convert <qty> <srcToken> <destToken> <optional: network>\n\n',
          '`Returns the reserve rates of a particular token in USD`\n',
          '/dRates <token> <qty> <optional: network>\n\n',
          '`Returns the reserve rates of a particular token in ETH`\n',
          '/eRates <token> <qty> <optional: network>\n\n',
          '`Returns the expected and worst rate after adding the network fee from the proxy contract`\n',
          '/getExpectedRate <srcToken> <destToken> <srcQty> <optional: network>\n\n',
          '`Returns the expected rate after adding the network and platform fee from the proxy contract`\n',
          '/getExpectedRateAfterFee <srcToken> <destToken> <srcQty> <platformFeeBps> <hint> <optional: network>\n\n',
          '`Returns the reserve rates of a particular token`\n',
          '/getReservesRates <token> <qty>\n\n',
          '`Returns the maxGasPrice info from the proxy contract`\n',
          '/maxGasPrice <optional: network>\n\n',
          '`Returns the Kyber contract addresses for a network`\n',
          '/networkContracts <optional: network>\n\n',
          '`Returns basic information from the Kyber network contract`\n',
          '/networkInfo <optional: network>\n\n',
          '`Alias for /getReservesRates`\n',
          '/rates <token> <qty> <optional: network>\n\n',
          '`Returns the reserve rates of a particular token using the token as the quote`\n',
          '/tRates <token> <qty> <optional: network>\n\n',
        );
        break;
      case 'hinthandler':
        help = help.concat(
          '**HINT HANDLER**\n',
          '=============\n',
          '`Builds the T2E, E2T, or T2T hint`\n',
          '/buildHint <tradePath> <tokenSrc> <tradeType> <reserveIds> <splits> [<tokenSrc> <tradeType> <reserveIds> <splits>] <optional: network>\n\n',
          '`Parses the T2E, E2T, or T2T hint`\n',
          '/parseHint <hint> <optional: network>\n\n',
        );
        break;
      case 'staking':
        help = help.concat(
          '**STAKING**\n',
          '=======\n',
          '`Returns the staker data for the latest epoch.`\n',
          '/latestStakerData <staker> <optional: network>\n\n',
          '`Iterates through all the epochs and returns the staker data up to current epoch + 1.`\n',
          '/stakerData <staker> <epoch> <optional: network>\n\n',
          '`Returns the raw staker data up to current epoch + 1. Returns 0 values if staker data is uninitialized.`\n',
          '/stakerRawData <staker> <epoch> <optional: network>\n\n',
          '`Returns the total staked KNC in the network.`\n',
          '/totalStaked <optional: network>\n\n',
        );
        break;
      case 'dao':
        help = help.concat(
          '**DAO**\n',
          '====\n',
          '`Returns the Burn, Reward, Rebates values in BPS`\n',
          '/brr <optional: network>\n\n',
          '`Returns the campaign details given the campaign ID`\n',
          '/daoCampaignDetails <campaignId> <optional: network>\n\n',
          '`Returns the campaign IDs of an epoch`\n',
          '/daoCampaignIds <epoch> <optional: network>\n\n',
          '`Returns the vote count data for a campaign`\n',
          '/daoCampaignVoteCount <campaignId> <optional: network>\n\n',
          '`Returns the winning option and value of a campaign `\n',
          '/daoCampaignWinData <campaignId> <optional: network>\n\n',
          '`Returns basic information from the Kyber DAO`\n',
          '/daoInfo <optional: network>\n\n',
          '`Returns staker reward percentage in precision for the current epoch`\n',
          '/daoLatestStakerPercentage <staker> <optional: network>\n\n',
          '`Check whether an epoch has rewards but no one can claim, and thus must be burned`\n',
          '/daoShouldBurnReward <epoch> <optional: network>\n\n',
          '`Returns staker reward percentage in precision`\n',
          '/daoStakerPercentage <staker> <epoch> <optional: network>\n\n',
          '`Returns the total points of an epoch`\n',
          '/daoTotalEpochPoints <epoch> <optional: network>\n\n',
        );
        break;
      case 'storage':
        help = help.concat(
          '**STORAGE**\n',
          '========\n',
          '`Returns the reserve addresses tied to a reserve ID`\n',
          '/reserveAddresses <reserrveId> <optional: network>\n\n',
          '`Returns the reserve ID given a reserve address`\n',
          '/reserveId <reserveAddress> <optional: network>\n\n',
          '`Returns all listed reserves in the network`\n',
          '/reserves <optional: network>\n\n',
          '`Returns the reserve IDs per token source and dest`\n',
          '/reservesPerToken <token> <optional: network>\n\n',
          '`Returns the source and dest tokens per reserve ID`\n',
          '/tokensPerReserve <reserveId> <optional: network>\n\n',
        );
        break;
      case 'feehandler':
        help = help.concat(
          '**FEE HANDLER**\n',
          '============\n',
          '`Returns the latest KNC/ETH sanity rate from FeeHandler`\n',
          '/feeLatestSanityRate <optional: network>\n\n',
          '`Returns list of SanityRates contracts from FeeHandler`\n',
          '/feeSanityRates <optional: network>\n\n',
          '`Returns the current amount of fees collected in the FeeHandler`\n',
          '/feesCollected <optional: network>\n\n',
        );
        break;
      case 'reserves':
        help = help.concat(
          '**RESERVES**\n',
          '============\n',
          '`Checks if the rates returned follows the liquidity params configured`\n',
          '/checkAPRRate <reserve> <optional: network>\n\n',
          '`Returns the collected fees of an APR`\n',
          '/collectedFeesInTwei <reserve> <optional: network>\n\n',
          '`Returns the conversion rate from the reserve contract`\n',
          '/getConversionRate <reserve> <srcToken> <destToken> <srcQty> <blockNumber> <optional: network>\n\n',
          '`Checks if the reserve is listed in any network`\n',
          '/isReserveListed <reserve> <optional: network>\n\n',
          '`Computes and returns the liquidity params based on the JSON input`\n',
          '/liquidityParams <json>\n\n',
          '`Computes and returns the liquidity rate based on the ETH and pMin input`\n',
          '/liquidityRate <eth> <pmin>\n\n',
          '`Returns all the token balances of a reserve`\n',
          '/reserveBalances <reserve> <optional: network>\n\n',
          '`Returns the network, conversionRates, and sanityRates contract addresses of a reserve`\n',
          '/reserveContracts <reserve> <optional: network>\n\n',
          '`Returns the fees set of a reserve in the FeeBurner`\n',
          '/reserveFeesInBps <reserve> <optional: network>\n\n',
          '`Returns the index of the reserve in the network`\n',
          '/reserveIndex <reserve> <optional: network>\n\n',
          '`Returns the registered KNC wallet address of a reserve in the FeeBurner`\n',
          '/reserveKNCWallet <reserve>\n\n',
          '`Returns the reserves that is support the token specified`\n',
          '/reservesOfToken <token>\n\n',
          '`Returns the tokens supported by a reserve`\n',
          '/tokensOfReserve <reserve>\n\n',
        );
        break;
      case 'misc':
        help = help.concat(
          '**MISC**\n',
          '============\n',
          '`Converts the input from token wei to human readable format`\n',
          '/fromTwei <qty> <token> <optional: network>\n\n',
          '`Converts the input from wei to human readable format`\n',
          '/fromWei <qty>\n\n',
          '`Returns the current gas price of the network, taken from ETHGasStation`\n',
          '/gas\n\n',
          '`Checks if the input is part of the fee sharing program`\n',
          '/isFeeSharingWallet <wallet>\n\n',
          '`Returns the latest block number of a network`\n',
          '/latestBlock <optional: network>\n\n',
          '`Returns the permissions of a Kyber contract`\n',
          '/permissions <kyberContract> <optional: network>\n\n',
          '`Display the market sentiment, taken from https://alternative.me/crypto/fear-and-greed-index`\n',
          '/sentiment\n\n',
          '`Returns the address of a token`\n',
          '/tokenAddress <token>\n\n',
          '`Returns the symbol, name, decimals, and totalSupply info of a token`\n',
          '/tokenInfo <token> <optional: network>\n\n',
          '`Converts the human readable format input to token wei`\n',
          '/toTwei <qty> <token> <optional: network>\n\n',
          '`Converts the human readable format input to wei`\n',
          '/toWei <qty>',
        );
        break;
      default:
        break;
    }

    replyWithMarkdown(help, inReplyTo(message.message_id));
  };
};
