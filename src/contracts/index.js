const fs = require('fs');
const logger = require('../logger');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));
const KyberNetworkProxyABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetworkProxy.abi', 'utf8'));
const KyberNetworkABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberNetwork.abi', 'utf8'));
const KyberMatchingEngineABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberMatchingEngine.abi', 'utf8'));
const KyberStorageABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberStorage.abi', 'utf8'));
const KyberHistoryABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberHistory.abi', 'utf8'));
const KyberFeeHandlerABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberFeeHandler.abi', 'utf8'));
const KyberStakingABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberStaking.abi', 'utf8'));
const KyberDaoABI = JSON.parse(fs.readFileSync('src/contracts/abi/KyberDao.abi', 'utf8'));
const FeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/FeeBurner.abi', 'utf8'));
const WrapFeeBurnerABI = JSON.parse(fs.readFileSync('src/contracts/abi/WrapFeeBurner.abi', 'utf8'));
const MedianizerABI = JSON.parse(fs.readFileSync('src/contracts/abi/Medianizer.abi', 'utf8'));
let KyberNetworkProxyAddress;
let KyberNetworkProxy;
let KyberNetworkAddress;
let KyberNetwork;
let KyberMatchingEngineAddress;
let KyberMatchingEngine;
let KyberStorageAddress;
let KyberStorage;
let KyberHistoryAddress;
let KyberHistory;
let KyberFeeHandlerAddress;
let KyberFeeHandler;
let KyberStakingAddress;
let KyberStaking;
let KyberDaoAddress;
let KyberDao;
let FeeBurnerAddress;
let FeeBurner;
let WrapFeeBurnerAddress;
let WrapFeeBurner;
let MedianizerAddress;
let Medianizer;

module.exports = app => {
  const { ethereum } = app.context;

  KyberNetworkProxyAddress = config.contracts.mainnet.KyberNetworkProxy;  
  KyberNetworkProxy = new ethereum.mainnet.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);
  
  KyberNetworkAddress = config.contracts.mainnet.KyberNetwork;  
  KyberNetwork = new ethereum.mainnet.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  KyberMatchingEngineAddress = config.contracts.mainnet.KyberMatchingEngine;  
  KyberMatchingEngine = new ethereum.mainnet.eth.Contract(KyberMatchingEngineABI, KyberMatchingEngineAddress);

  KyberStorageAddress = config.contracts.mainnet.KyberStorage;  
  KyberStorage = new ethereum.mainnet.eth.Contract(KyberStorageABI, KyberStorageAddress);

  KyberHistoryAddress = config.contracts.mainnet.KyberHistory;  
  KyberHistory = new ethereum.mainnet.eth.Contract(KyberHistoryABI, KyberHistoryAddress);

  KyberFeeHandlerAddress = config.contracts.mainnet.KyberFeeHandler;  
  KyberFeeHandler = new ethereum.mainnet.eth.Contract(KyberFeeHandlerABI, KyberFeeHandlerAddress);

  KyberStakingAddress = config.contracts.mainnet.KyberStaking;  
  KyberStaking = new ethereum.mainnet.eth.Contract(KyberStakingABI, KyberStakingAddress);

  KyberDaoAddress = config.contracts.mainnet.KyberDao;  
  KyberDao = new ethereum.mainnet.eth.Contract(KyberDaoABI, KyberDaoAddress);

  FeeBurnerAddress = config.contracts.mainnet.FeeBurner;
  FeeBurner = new ethereum.mainnet.eth.Contract(FeeBurnerABI, FeeBurnerAddress);

  WrapFeeBurnerAddress = config.contracts.mainnet.WrapFeeBurner;
  WrapFeeBurner = new ethereum.mainnet.eth.Contract(WrapFeeBurnerABI, WrapFeeBurnerAddress);

  MedianizerAddress = config.contracts.mainnet.Medianizer;
  Medianizer = new ethereum.mainnet.eth.Contract(MedianizerABI, MedianizerAddress);

  const mainnet = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
    'KyberMatchingEngine': KyberMatchingEngine,
    'KyberStorage': KyberStorage,
    'KyberHistory': KyberHistory,
    'KyberFeeHandler': KyberFeeHandler,
    'KyberStaking': KyberStaking,
    'KyberDao': KyberDao,
    'FeeBurner': FeeBurner,
    'WrapFeeBurner': WrapFeeBurner,
    'Medianizer': Medianizer,
  };

  KyberNetworkProxyAddress = config.contracts.staging.KyberNetworkProxy;  
  KyberNetworkProxy = new ethereum.mainnet.eth.Contract(KyberNetworkProxyABI, KyberNetworkProxyAddress);
  
  KyberNetworkAddress = config.contracts.staging.KyberNetwork;  
  KyberNetwork = new ethereum.mainnet.eth.Contract(KyberNetworkABI, KyberNetworkAddress);

  KyberMatchingEngineAddress = config.contracts.staging.KyberMatchingEngine;  
  KyberMatchingEngine = new ethereum.mainnet.eth.Contract(KyberMatchingEngineABI, KyberMatchingEngineAddress);

  KyberStorageAddress = config.contracts.staging.KyberStorage;  
  KyberStorage = new ethereum.mainnet.eth.Contract(KyberStorageABI, KyberStorageAddress);

  KyberHistoryAddress = config.contracts.staging.KyberHistory;  
  KyberHistory = new ethereum.mainnet.eth.Contract(KyberHistoryABI, KyberHistoryAddress);

  KyberFeeHandlerAddress = config.contracts.staging.KyberFeeHandler;  
  KyberFeeHandler = new ethereum.mainnet.eth.Contract(KyberFeeHandlerABI, KyberFeeHandlerAddress);

  KyberStakingAddress = config.contracts.staging.KyberStaking;  
  KyberStaking = new ethereum.mainnet.eth.Contract(KyberStakingABI, KyberStakingAddress);

  KyberDaoAddress = config.contracts.staging.KyberDao;  
  KyberDao = new ethereum.mainnet.eth.Contract(KyberDaoABI, KyberDaoAddress);

  const staging = {
    'KyberNetworkProxy': KyberNetworkProxy,
    'KyberNetwork': KyberNetwork,
    'KyberMatchingEngine': KyberMatchingEngine,
    'KyberStorage': KyberStorage,
    'KyberHistory': KyberHistory,
    'KyberFeeHandler': KyberFeeHandler,
    'KyberStaking': KyberStaking,
    'KyberDao': KyberDao,
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
