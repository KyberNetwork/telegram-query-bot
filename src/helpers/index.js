const logger = require('../logger');

module.exports = (app) => {
  const { contracts, ethereum } = app.context;
  const {
    KyberNetworkProxy: KyberNetworkProxyMainnet,
    KyberNetwork: KyberNetworkMainnet,
    KyberMatchingEngine: KyberMatchingEngineMainnet,
    KyberStorage: KyberStorageMainnet,
    KyberHistory: KyberHistoryMainnet,
    KyberFeeHandler: KyberFeeHandlerMainnet,
    KyberStaking: KyberStakingMainnet,
    KyberDao: KyberDaoMainnet,
    RateHelper: RateHelperMainnet,
  } = contracts.mainnet;
  const {
    KyberNetworkProxy: KyberNetworkProxyStaging,
    KyberNetwork: KyberNetworkStaging,
    KyberMatchingEngine: KyberMatchingEngineStaging,
    KyberStorage: KyberStorageStaging,
    KyberHistory: KyberHistoryStaging,
    KyberFeeHandler: KyberFeeHandlerStaging,
    KyberStaking: KyberStakingStaging,
    KyberDao: KyberDaoStaging,
    RateHelper: RateHelperStaging,
  } = contracts.staging;
  const {
    KyberNetworkProxy: KyberNetworkProxyRopsten,
    KyberNetwork: KyberNetworkRopsten,
    KyberMatchingEngine: KyberMatchingEngineRopsten,
    KyberStorage: KyberStorageRopsten,
    KyberHistory: KyberHistoryRopsten,
    KyberFeeHandler: KyberFeeHandlerRopsten,
    KyberStaking: KyberStakingRopsten,
    KyberDao: KyberDaoRopsten,
    // RateHelper: RateHelperMainnet,
  } = contracts.ropsten;
  const {
    KyberNetworkProxy: KyberNetworkProxyRinkeby,
    KyberNetwork: KyberNetworkRinkeby,
    KyberMatchingEngine: KyberMatchingEngineRinkeby,
    KyberStorage: KyberStorageRinkeby,
    KyberHistory: KyberHistoryRinkeby,
    KyberFeeHandler: KyberFeeHandlerRinkeby,
    KyberStaking: KyberStakingRinkeby,
    KyberDao: KyberDaoRinkeby,
    // RateHelper: RateHelperMainnet,
  } = contracts.rinkeby;
  const {
    KyberNetworkProxy: KyberNetworkProxyKovan,
    KyberNetwork: KyberNetworkKovan,
    KyberMatchingEngine: KyberMatchingEngineKovan,
    KyberStorage: KyberStorageKovan,
    KyberHistory: KyberHistoryKovan,
    KyberFeeHandler: KyberFeeHandlerKovan,
    KyberStaking: KyberStakingKovan,
    KyberDao: KyberDaoKovan,
    // RateHelper: RateHelperMainnet,
  } = contracts.kovan;

  const emojis = (emoji) => {
    let emojiDict = {
      checkMark: '\u{2705}',
      crossMark: '\u{274C}',
    };
    return emojiDict[emoji];
  };

  const getProxyFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberNetworkProxyStaging[func];
      case 'ropsten':
        return KyberNetworkProxyRopsten[func];
      case 'rinkeby':
        return KyberNetworkProxyRinkeby[func];
      case 'kovan':
        return KyberNetworkProxyKovan[func];
      default:
        return KyberNetworkProxyMainnet[func];
    }
  };

  const getNetworkFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberNetworkStaging[func];
      case 'ropsten':
        return KyberNetworkRopsten[func];
      case 'rinkeby':
        return KyberNetworkRinkeby[func];
      case 'kovan':
        return KyberNetworkKovan[func];
      default:
        return KyberNetworkMainnet[func];
    }
  };

  const getMatchingEngineFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberMatchingEngineStaging[func];
      case 'ropsten':
        return KyberMatchingEngineRopsten[func];
      case 'rinkeby':
        return KyberMatchingEngineRinkeby[func];
      case 'kovan':
        return KyberMatchingEngineKovan[func];
      default:
        return KyberMatchingEngineMainnet[func];
    }
  };

  const getStorageFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberStorageStaging[func];
      case 'ropsten':
        return KyberStorageRopsten[func];
      case 'rinkeby':
        return KyberStorageRinkeby[func];
      case 'kovan':
        return KyberStorageKovan[func];
      default:
        return KyberStorageMainnet[func];
    }
  };

  const getHistoryFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberHistoryStaging[func];
      case 'ropsten':
        return KyberHistoryRopsten[func];
      case 'rinkeby':
        return KyberHistoryRinkeby[func];
      case 'kovan':
        return KyberHistoryKovan[func];
      default:
        return KyberHistoryMainnet[func];
    }
  };

  const getFeeHandlerFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberFeeHandlerStaging[func];
      case 'ropsten':
        return KyberFeeHandlerRopsten[func];
      case 'rinkeby':
        return KyberFeeHandlerRinkeby[func];
      case 'kovan':
        return KyberFeeHandlerKovan[func];
      default:
        return KyberFeeHandlerMainnet[func];
    }
  };

  const getStakingFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberStakingStaging[func];
      case 'ropsten':
        return KyberStakingRopsten[func];
      case 'rinkeby':
        return KyberStakingRinkeby[func];
      case 'kovan':
        return KyberStakingKovan[func];
      default:
        return KyberStakingMainnet[func];
    }
  };

  const getDaoFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberDaoStaging[func];
      case 'ropsten':
        return KyberDaoRopsten[func];
      case 'rinkeby':
        return KyberDaoRinkeby[func];
      case 'kovan':
        return KyberDaoKovan[func];
      default:
        return KyberDaoMainnet[func];
    }
  };

  const getRateFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return RateHelperStaging[func];
      // case 'ropsten':
      //   return RateHelperRopsten[func];
      // case 'rinkeby':
      //   return RateHelperRinkeby[func];
      // case 'kovan':
      //   return RateHelperKovan[func];
      default:
        return RateHelperMainnet[func];
    }
  };

  const getEthLib = (network) => {
    switch (network) {
      case 'ropsten':
        return ethereum.ropsten;
      case 'rinkeby':
        return ethereum.rinkeby;
      case 'kovan':
        return ethereum.kovan;
      default:
        return ethereum.mainnet;
    }
  };

  const formatTime = (seconds) => {
    let dt = new Date(0);
    let formattedDate = '';
    dt.setUTCSeconds(seconds);
    return formattedDate.concat(
      dt.getUTCDate().toString().padStart(2, '0'),
      '-',
      (dt.getUTCMonth() + 1).toString().padStart(2, '0'),
      '-',
      dt.getUTCFullYear(),
      ' ',
      dt.getUTCHours().toString().padStart(2, '0'),
      ':',
      dt.getUTCMinutes().toString().padStart(2, '0'),
      ':',
      dt.getUTCSeconds().toString().padStart(2, '0'),
      ' UTC'
    );
  };

  const to32Bytes = (reserveId) => {
    while (reserveId.length != 66) {
      reserveId += '0';
    }
    return reserveId;
  };

  const toHumanNum = (number) => {
    number = Number(number);
    if (number > 1000000) {
      return `${(number / 1000000).toFixed(3)}M`;
    } else if (number > 1000) {
      return `${(number / 1000).toFixed(3)}K`;
    } else {
      return number.toFixed(3);
    }
  };

  const toHumanWei = (number) => {
    return toHumanNum(number / ethereum.mainnet.ethers.constants.WeiPerEther);
  };

  const reserveIdToAscii = (reserveId) => {
    let hex = reserveId
      .toString()
      .substr(2, reserveId.length)
      .replace(/0+$/, '');
    let reserveType = hex.substr(0, 2);

    switch (hex.substr(0, 2)) {
      case 'ff':
        reserveType = 'FPR';
        break;
      case 'aa':
        reserveType = 'APR';
        break;
      case 'bb':
        reserveType = 'BRIDGE';
        break;
      case '00':
        reserveType = 'UTILITY';
        break;
      default:
        reserveType = 'NONE';
        break;
    }

    hex = hex.substr(2, reserveId.length);
    let result = '';
    for (var i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return [result, reserveType];
  };

  const reserveTypes = (resType) => {
    const resTypes = [
      'NONE',
      'FPR',
      'APR',
      'BRIDGE',
      'UTILITY',
      'CUSTOM',
      'ORDERBOOK',
    ];
    return resTypes[resType];
  };

  app.context.helpers = {
    emojis,
    getProxyFunction,
    getNetworkFunction,
    getMatchingEngineFunction,
    getStorageFunction,
    getHistoryFunction,
    getFeeHandlerFunction,
    getStakingFunction,
    getDaoFunction,
    getRateFunction,
    getEthLib,
    formatTime,
    to32Bytes,
    toHumanNum,
    toHumanWei,
    reserveIdToAscii,
    reserveTypes,
  };

  logger.info('Initialized helpers');
};
