const logger = require('../logger');

module.exports = app => {
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
  
  const getProxyFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberNetworkProxyStaging.methods[func];
      case 'ropsten':
        return KyberNetworkProxyRopsten.methods[func];
      case 'rinkeby':
        return KyberNetworkProxyRinkeby.methods[func]; 
      case 'kovan':
        return KyberNetworkProxyKovan.methods[func];
      default:
        return KyberNetworkProxyMainnet.methods[func]; 
    }
  };

  const getNetworkFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberNetworkStaging.methods[func];
      case 'ropsten':
        return KyberNetworkRopsten.methods[func];
      case 'rinkeby':
        return KyberNetworkRinkeby.methods[func]; 
      case 'kovan':
        return KyberNetworkKovan.methods[func];
      default:
        return KyberNetworkMainnet.methods[func]; 
    }
  };

  const getMatchingEngineFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberMatchingEngineStaging.methods[func];
      case 'ropsten':
        return KyberMatchingEngineRopsten.methods[func];
      case 'rinkeby':
        return KyberMatchingEngineRinkeby.methods[func]; 
      case 'kovan':
        return KyberMatchingEngineKovan.methods[func];
      default:
        return KyberMatchingEngineMainnet.methods[func]; 
    }
  };

  const getStorageFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberStorageStaging.methods[func];
      case 'ropsten':
        return KyberStorageRopsten.methods[func];
      case 'rinkeby':
        return KyberStorageRinkeby.methods[func]; 
      case 'kovan':
        return KyberStorageKovan.methods[func];
      default:
        return KyberStorageMainnet.methods[func]; 
    }
  };

  const getHistoryFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberHistoryStaging.methods[func];
      case 'ropsten':
        return KyberHistoryRopsten.methods[func];
      case 'rinkeby':
        return KyberHistoryRinkeby.methods[func]; 
      case 'kovan':
        return KyberHistoryKovan.methods[func];
      default:
        return KyberHistoryMainnet.methods[func]; 
    }
  };

  const getFeeHandlerFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberFeeHandlerStaging.methods[func];
      case 'ropsten':
        return KyberFeeHandlerRopsten.methods[func];
      case 'rinkeby':
        return KyberFeeHandlerRinkeby.methods[func]; 
      case 'kovan':
        return KyberFeeHandlerKovan.methods[func];
      default:
        return KyberFeeHandlerMainnet.methods[func]; 
    }
  };

  const getStakingFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberStakingStaging.methods[func];
      case 'ropsten':
        return KyberStakingRopsten.methods[func];
      case 'rinkeby':
        return KyberStakingRinkeby.methods[func]; 
      case 'kovan':
        return KyberStakingKovan.methods[func];
      default:
        return KyberStakingMainnet.methods[func]; 
    }
  };

  const getDaoFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return KyberDaoStaging.methods[func];
      case 'ropsten':
        return KyberDaoRopsten.methods[func];
      case 'rinkeby':
        return KyberDaoRinkeby.methods[func]; 
      case 'kovan':
        return KyberDaoKovan.methods[func];
      default:
        return KyberDaoMainnet.methods[func]; 
    }
  };

  const getRateFunction = (network, func) => {
    switch (network.toLowerCase()) {
      case 'staging':
        return RateHelperStaging.methods[func];
      // case 'ropsten':
      //   return RateHelperRopsten.methods[func];
      // case 'rinkeby':
      //   return RateHelperRinkeby.methods[func]; 
      // case 'kovan':
      //   return RateHelperKovan.methods[func];
      default:
        return RateHelperMainnet.methods[func]; 
    }
  };

  const getWeb3 = network => {
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

  const formatTime = seconds => {
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
      ' UTC',
    );
  };

  const reserveIdToAscii = reserveId => {
    let hex = reserveId.toString().substr(2, reserveId.length).replace(/0+$/, '');
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

  app.context.helpers = {
    getProxyFunction,
    getNetworkFunction,
    getMatchingEngineFunction,
    getStorageFunction,
    getHistoryFunction,
    getFeeHandlerFunction,
    getStakingFunction,
    getDaoFunction,
    getRateFunction,
    getWeb3,
    formatTime,
    reserveIdToAscii,
  };

  logger.info('Initialized helpers');
};
