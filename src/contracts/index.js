const fs = require('fs');
const logger = require('../logger');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));

module.exports = app => {
  const web3 = app.context.web3;

  const KyberNetworkProxyAddress = config.contracts.KyberNetworkProxy;
  const KyberNetworkProxyABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetworkProxy.abi', 'utf8'));
  const KyberNetworkProxy = new web3.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);

  const KyberNetworkProxyStagingAddress = config.contracts.KyberNetworkProxyStaging;
  const KyberNetworkProxyStagingABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetworkProxy.abi', 'utf8'));
  const KyberNetworkProxyStaging = new web3.eth.Contract(KyberNetworkProxyStagingABI, KyberNetworkProxyStagingAddress);

  const KyberNetworkAddress = config.contracts.KyberNetwork;
  const KyberNetworkABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetwork.abi', 'utf8'));
  const KyberNetwork = new web3.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  const KyberNetworkStagingAddress = config.contracts.KyberNetworkStaging;
  const KyberNetworkStagingABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetwork.abi', 'utf8'));
  const KyberNetworkStaging = new web3.eth.Contract(KyberNetworkStagingABI, KyberNetworkStagingAddress);

  const FeeBurnerAddress = config.contracts.FeeBurner;
  const FeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/FeeBurner.abi', 'utf8'));
  const FeeBurner = new web3.eth.Contract(FeeBurnerABI, FeeBurnerAddress);

  const WrapFeeBurnerAddress = config.contracts.WrapFeeBurner;
  const WrapFeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/WrapFeeBurner.abi', 'utf8'));
  const WrapFeeBurner = new web3.eth.Contract(WrapFeeBurnerABI, WrapFeeBurnerAddress);

  const PermissionlessOrderbookReserveListerAddress = config.contracts.PermissionlessOrderbookReserveLister;
  const PermissionlessOrderbookReserveListerABI = JSON.parse(fs.readFileSync('src/contracts/abi/PermissionlessOrderbookReserveLister.abi', 'utf8'));
  const PermissionlessOrderbookReserveLister = new web3.eth.Contract(PermissionlessOrderbookReserveListerABI, PermissionlessOrderbookReserveListerAddress);

  app.context.contracts = {
    KyberNetworkProxy,
    KyberNetworkProxyStaging,
    KyberNetwork,
    KyberNetworkStaging,
    FeeBurner,
    WrapFeeBurner,
    PermissionlessOrderbookReserveLister,
  };

  logger.info('Initialized contracts');
};
