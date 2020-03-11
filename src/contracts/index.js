const fs = require('fs');
const logger = require('../logger');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));
const KyberNetworkProxyABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetworkProxy.abi', 'utf8'));
const KyberNetworkABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetwork.abi', 'utf8'));
const FeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/FeeBurner.abi', 'utf8'));
const WrapFeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/WrapFeeBurner.abi', 'utf8'));
const PermissionlessOrderbookReserveListerABI = JSON.parse(fs.readFileSync('src/contracts/abi/PermissionlessOrderbookReserveLister.abi', 'utf8'));
let KyberNetworkProxyAddress;
let KyberNetworkProxy;
let KyberNetworkAddress;
let KyberNetwork;
let FeeBurnerAddress;
let FeeBurner;
let WrapFeeBurnerAddress;
let WrapFeeBurner;
let PermissionlessOrderbookReserveListerAddress;
let PermissionlessOrderbookReserveLister;

module.exports = app => {
  const { ethereum } = app.context;

  KyberNetworkProxyAddress = config.contracts.mainnet.KyberNetworkProxy;  
  KyberNetworkProxy = new ethereum.mainnet.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);
  
  KyberNetworkAddress = config.contracts.mainnet.KyberNetwork;  
  KyberNetwork = new ethereum.mainnet.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  FeeBurnerAddress = config.contracts.mainnet.FeeBurner;
  FeeBurner = new ethereum.mainnet.eth.Contract(FeeBurnerABI, FeeBurnerAddress);

  WrapFeeBurnerAddress = config.contracts.mainnet.WrapFeeBurner;
  WrapFeeBurner = new ethereum.mainnet.eth.Contract(WrapFeeBurnerABI, WrapFeeBurnerAddress);

  PermissionlessOrderbookReserveListerAddress = config.contracts.mainnet.PermissionlessOrderbookReserveLister;
  PermissionlessOrderbookReserveLister = new ethereum.mainnet.eth.Contract(PermissionlessOrderbookReserveListerABI, PermissionlessOrderbookReserveListerAddress);

  const mainnet = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
    'FeeBurner': FeeBurner,
    'WrapFeeBurner': WrapFeeBurner,
    'PermissionlessOrderbookReserveLister': PermissionlessOrderbookReserveLister,
  };

  KyberNetworkProxyAddress = config.contracts.staging.KyberNetworkProxy;
  KyberNetworkProxy = new ethereum.mainnet.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);

  KyberNetworkAddress = config.contracts.staging.KyberNetwork;
  KyberNetwork = new ethereum.mainnet.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  const staging = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
  };

  KyberNetworkProxyAddress = config.contracts.ropsten.KyberNetworkProxy;
  KyberNetworkProxy = new ethereum.ropsten.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);

  KyberNetworkAddress = config.contracts.ropsten.KyberNetwork;
  KyberNetwork = new ethereum.ropsten.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  const ropsten = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
  };

  KyberNetworkProxyAddress = config.contracts.rinkeby.KyberNetworkProxy;
  KyberNetworkProxy = new ethereum.rinkeby.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);

  KyberNetworkAddress = config.contracts.rinkeby.KyberNetwork;
  KyberNetwork = new ethereum.rinkeby.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  const rinkeby = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
  };

  KyberNetworkProxyAddress = config.contracts.kovan.KyberNetworkProxy;
  KyberNetworkProxy = new ethereum.kovan.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);

  KyberNetworkAddress = config.contracts.kovan.KyberNetwork;
  KyberNetwork = new ethereum.kovan.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  const kovan = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
  };

  app.context.contracts = {
    mainnet,
    staging,
    ropsten,
    rinkeby,
    kovan,
  };

  logger.info('Initialized contracts');
};
