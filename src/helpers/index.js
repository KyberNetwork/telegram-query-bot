const logger = require('../logger');

module.exports = app => {
  const { contracts, ethereum } = app.context;
  const {
    KyberNetworkProxy: KyberNetworkProxyMainnet,
    KyberNetwork: KyberNetworkMainnet,
  } = contracts.mainnet;
  const {
    KyberNetworkProxy: KyberNetworkProxyStaging,
    KyberNetwork: KyberNetworkStaging,
  } = contracts.staging;
  const {
    KyberNetworkProxy: KyberNetworkProxyRopsten,
    KyberNetwork: KyberNetworkRopsten,
  } = contracts.ropsten;
  const {
    KyberNetworkProxy: KyberNetworkProxyRinkeby,
    KyberNetwork: KyberNetworkRinkeby,
  } = contracts.rinkeby;
  const {
    KyberNetworkProxy: KyberNetworkProxyKovan,
    KyberNetwork: KyberNetworkKovan,
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

  app.context.helpers = {
    getProxyFunction,
    getNetworkFunction,
    getWeb3,
  };

  logger.info('Initialized helpers');
};
