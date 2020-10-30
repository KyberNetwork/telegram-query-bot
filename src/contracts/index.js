const ethers = require('ethers');
const fs = require('fs');
const logger = require('../logger');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));
const KyberNetworkProxyABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberNetworkProxy.abi', 'utf8')
);
const KyberNetworkABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberNetwork.abi', 'utf8')
);
const KyberMatchingEngineABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberMatchingEngine.abi', 'utf8')
);
const KyberStorageABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberStorage.abi', 'utf8')
);
const KyberHistoryABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberHistory.abi', 'utf8')
);
const KyberFeeHandlerABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberFeeHandler.abi', 'utf8')
);
const KyberStakingABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberStaking.abi', 'utf8')
);
const KyberDaoABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/KyberDao.abi', 'utf8')
);
const FeeBurnerABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/FeeBurner.abi', 'utf8')
);
const WrapFeeBurnerABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/WrapFeeBurner.abi', 'utf8')
);
const RateHelperABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/RateHelper.abi', 'utf8')
);
const MedianizerABI = JSON.parse(
  fs.readFileSync('src/contracts/abi/Medianizer.abi', 'utf8')
);

let provider;

let KyberNetworkProxyAddress;
let KyberNetworkProxy;
let KyberNetworkAddress;
let KyberNetwork;
let KyberMatchingEngineAddress;
let KyberMatchingEngine;
let KyberStorageAddress;
let KyberStorage;
let NetworkHistoryAddress;
let NetworkHistory;
let FeeHandlerHistoryAddress;
let FeeHandlerHistory;
let DaoHistoryAddress;
let DaoHistory;
let MatchingEngineHistoryAddress;
let MatchingEngineHistory;
let KyberFeeHandlerAddress;
let KyberFeeHandler;
let KyberStakingAddress;
let KyberStaking;
let KyberDaoAddress;
let KyberDao;
let RateHelperAddress;
let RateHelper;
let FeeBurnerAddress;
let FeeBurner;
let WrapFeeBurnerAddress;
let WrapFeeBurner;
let MedianizerAddress;
let Medianizer;

module.exports = (app) => {
  const { ethereum } = app.context;

  provider = ethereum.mainnet.provider;

  KyberNetworkProxyAddress = config.contracts.mainnet.KyberNetworkProxy;
  KyberNetworkProxy = new ethers.Contract(
    KyberNetworkProxyAddress,
    KyberNetworkProxyABI,
    provider
  );

  KyberNetworkAddress = config.contracts.mainnet.KyberNetwork;
  KyberNetwork = new ethers.Contract(
    KyberNetworkAddress,
    KyberNetworkABI,
    provider
  );

  KyberMatchingEngineAddress = config.contracts.mainnet.KyberMatchingEngine;
  KyberMatchingEngine = new ethers.Contract(
    KyberMatchingEngineAddress,
    KyberMatchingEngineABI,
    provider
  );

  KyberStorageAddress = config.contracts.mainnet.KyberStorage;
  KyberStorage = new ethers.Contract(
    KyberStorageAddress,
    KyberStorageABI,
    provider
  );

  NetworkHistoryAddress = config.contracts.mainnet.NetworkHistory;
  NetworkHistory = new ethers.Contract(
    NetworkHistoryAddress,
    KyberHistoryABI,
    provider
  );

  FeeHandlerHistoryAddress = config.contracts.mainnet.FeeHandlerHistory;
  FeeHandlerHistory = new ethers.Contract(
    FeeHandlerHistoryAddress,
    KyberHistoryABI,
    provider
  );

  DaoHistoryAddress = config.contracts.mainnet.DaoHistory;
  DaoHistory = new ethers.Contract(
    DaoHistoryAddress,
    KyberHistoryABI,
    provider
  );

  MatchingEngineHistoryAddress = config.contracts.mainnet.MatchingEngineHistory;
  MatchingEngineHistory = new ethers.Contract(
    MatchingEngineHistoryAddress,
    KyberHistoryABI,
    provider
  );

  KyberFeeHandlerAddress = config.contracts.mainnet.KyberFeeHandler;
  KyberFeeHandler = new ethers.Contract(
    KyberFeeHandlerAddress,
    KyberFeeHandlerABI,
    provider
  );

  KyberStakingAddress = config.contracts.mainnet.KyberStaking;
  KyberStaking = new ethers.Contract(
    KyberStakingAddress,
    KyberStakingABI,
    provider
  );

  KyberDaoAddress = config.contracts.mainnet.KyberDao;
  KyberDao = new ethers.Contract(KyberDaoAddress, KyberDaoABI, provider);

  RateHelperAddress = config.contracts.mainnet.RateHelper;
  RateHelper = new ethers.Contract(RateHelperAddress, RateHelperABI, provider);

  FeeBurnerAddress = config.contracts.mainnet.FeeBurner;
  FeeBurner = new ethers.Contract(FeeBurnerAddress, FeeBurnerABI, provider);

  WrapFeeBurnerAddress = config.contracts.mainnet.WrapFeeBurner;
  WrapFeeBurner = new ethers.Contract(
    WrapFeeBurnerAddress,
    WrapFeeBurnerABI,
    provider
  );

  MedianizerAddress = config.contracts.mainnet.Medianizer;
  Medianizer = new ethers.Contract(MedianizerAddress, MedianizerABI, provider);

  const mainnet = {
    KyberNetworkProxy: KyberNetworkProxy,
    KyberNetwork: KyberNetwork,
    KyberMatchingEngine: KyberMatchingEngine,
    KyberStorage: KyberStorage,
    NetworkHistory: NetworkHistory,
    FeeHandlerHistory: FeeHandlerHistory,
    DaoHistory: DaoHistory,
    MatchingEngineHistory: MatchingEngineHistory,
    KyberFeeHandler: KyberFeeHandler,
    KyberStaking: KyberStaking,
    KyberDao: KyberDao,
    RateHelper: RateHelper,
    FeeBurner: FeeBurner,
    WrapFeeBurner: WrapFeeBurner,
    Medianizer: Medianizer,
  };

  KyberNetworkProxyAddress = config.contracts.staging.KyberNetworkProxy;
  KyberNetworkProxy = new ethers.Contract(
    KyberNetworkProxyAddress,
    KyberNetworkProxyABI,
    provider
  );

  KyberNetworkAddress = config.contracts.staging.KyberNetwork;
  KyberNetwork = new ethers.Contract(
    KyberNetworkAddress,
    KyberNetworkABI,
    provider
  );

  KyberMatchingEngineAddress = config.contracts.staging.KyberMatchingEngine;
  KyberMatchingEngine = new ethers.Contract(
    KyberMatchingEngineAddress,
    KyberMatchingEngineABI,
    provider
  );

  KyberStorageAddress = config.contracts.staging.KyberStorage;
  KyberStorage = new ethers.Contract(
    KyberStorageAddress,
    KyberStorageABI,
    provider
  );

  NetworkHistoryAddress = config.contracts.staging.NetworkHistory;
  NetworkHistory = new ethers.Contract(
    NetworkHistoryAddress,
    KyberHistoryABI,
    provider
  );

  FeeHandlerHistoryAddress = config.contracts.staging.FeeHandlerHistory;
  FeeHandlerHistory = new ethers.Contract(
    FeeHandlerHistoryAddress,
    KyberHistoryABI,
    provider
  );

  DaoHistoryAddress = config.contracts.staging.DaoHistory;
  DaoHistory = new ethers.Contract(
    DaoHistoryAddress,
    KyberHistoryABI,
    provider
  );

  MatchingEngineHistoryAddress = config.contracts.staging.MatchingEngineHistory;
  MatchingEngineHistory = new ethers.Contract(
    MatchingEngineHistoryAddress,
    KyberHistoryABI,
    provider
  );

  KyberFeeHandlerAddress = config.contracts.staging.KyberFeeHandler;
  KyberFeeHandler = new ethers.Contract(
    KyberFeeHandlerAddress,
    KyberFeeHandlerABI,
    provider
  );

  KyberStakingAddress = config.contracts.staging.KyberStaking;
  KyberStaking = new ethers.Contract(
    KyberStakingAddress,
    KyberStakingABI,
    provider
  );

  KyberDaoAddress = config.contracts.staging.KyberDao;
  KyberDao = new ethers.Contract(KyberDaoAddress, KyberDaoABI, provider);

  RateHelperAddress = config.contracts.staging.RateHelper;
  RateHelper = new ethers.Contract(RateHelperAddress, RateHelperABI, provider);

  const staging = {
    KyberNetworkProxy: KyberNetworkProxy,
    KyberNetwork: KyberNetwork,
    KyberMatchingEngine: KyberMatchingEngine,
    KyberStorage: KyberStorage,
    NetworkHistory: NetworkHistory,
    FeeHandlerHistory: FeeHandlerHistory,
    DaoHistory: DaoHistory,
    MatchingEngineHistory: MatchingEngineHistory,
    KyberFeeHandler: KyberFeeHandler,
    KyberStaking: KyberStaking,
    KyberDao: KyberDao,
    RateHelper: RateHelper,
  };

  provider = ethereum.ropsten.provider;

  KyberNetworkProxyAddress = config.contracts.ropsten.KyberNetworkProxy;
  KyberNetworkProxy = new ethers.Contract(
    KyberNetworkProxyAddress,
    KyberNetworkProxyABI,
    provider
  );

  KyberNetworkAddress = config.contracts.ropsten.KyberNetwork;
  KyberNetwork = new ethers.Contract(
    KyberNetworkAddress,
    KyberNetworkABI,
    provider
  );

  KyberMatchingEngineAddress = config.contracts.ropsten.KyberMatchingEngine;
  KyberMatchingEngine = new ethers.Contract(
    KyberMatchingEngineAddress,
    KyberMatchingEngineABI,
    provider
  );

  KyberStorageAddress = config.contracts.ropsten.KyberStorage;
  KyberStorage = new ethers.Contract(
    KyberStorageAddress,
    KyberStorageABI,
    provider
  );

  NetworkHistoryAddress = config.contracts.ropsten.NetworkHistory;
  NetworkHistory = new ethers.Contract(
    NetworkHistoryAddress,
    KyberHistoryABI,
    provider
  );

  FeeHandlerHistoryAddress = config.contracts.ropsten.FeeHandlerHistory;
  FeeHandlerHistory = new ethers.Contract(
    FeeHandlerHistoryAddress,
    KyberHistoryABI,
    provider
  );

  DaoHistoryAddress = config.contracts.ropsten.DaoHistory;
  DaoHistory = new ethers.Contract(
    DaoHistoryAddress,
    KyberHistoryABI,
    provider
  );

  MatchingEngineHistoryAddress = config.contracts.ropsten.MatchingEngineHistory;
  MatchingEngineHistory = new ethers.Contract(
    MatchingEngineHistoryAddress,
    KyberHistoryABI,
    provider
  );

  KyberFeeHandlerAddress = config.contracts.ropsten.KyberFeeHandler;
  KyberFeeHandler = new ethers.Contract(
    KyberFeeHandlerAddress,
    KyberFeeHandlerABI,
    provider
  );

  KyberStakingAddress = config.contracts.ropsten.KyberStaking;
  KyberStaking = new ethers.Contract(
    KyberStakingAddress,
    KyberStakingABI,
    provider
  );

  KyberDaoAddress = config.contracts.ropsten.KyberDao;
  KyberDao = new ethers.Contract(KyberDaoAddress, KyberDaoABI, provider);

  const ropsten = {
    KyberNetworkProxy: KyberNetworkProxy,
    KyberNetwork: KyberNetwork,
    KyberMatchingEngine: KyberMatchingEngine,
    KyberStorage: KyberStorage,
    NetworkHistory: NetworkHistory,
    FeeHandlerHistory: FeeHandlerHistory,
    DaoHistory: DaoHistory,
    MatchingEngineHistory: MatchingEngineHistory,
    KyberFeeHandler: KyberFeeHandler,
    KyberStaking: KyberStaking,
    KyberDao: KyberDao,
  };

  provider = ethereum.rinkeby.provider;

  KyberNetworkProxyAddress = config.contracts.rinkeby.KyberNetworkProxy;
  KyberNetworkProxy = new ethers.Contract(
    KyberNetworkProxyAddress,
    KyberNetworkProxyABI,
    provider
  );

  KyberNetworkAddress = config.contracts.rinkeby.KyberNetwork;
  KyberNetwork = new ethers.Contract(
    KyberNetworkAddress,
    KyberNetworkABI,
    provider
  );

  KyberMatchingEngineAddress = config.contracts.rinkeby.KyberMatchingEngine;
  KyberMatchingEngine = new ethers.Contract(
    KyberMatchingEngineAddress,
    KyberMatchingEngineABI,
    provider
  );

  KyberStorageAddress = config.contracts.rinkeby.KyberStorage;
  KyberStorage = new ethers.Contract(
    KyberStorageAddress,
    KyberStorageABI,
    provider
  );

  NetworkHistoryAddress = config.contracts.rinkeby.NetworkHistory;
  NetworkHistory = new ethers.Contract(
    NetworkHistoryAddress,
    KyberHistoryABI,
    provider
  );

  FeeHandlerHistoryAddress = config.contracts.rinkeby.FeeHandlerHistory;
  FeeHandlerHistory = new ethers.Contract(
    FeeHandlerHistoryAddress,
    KyberHistoryABI,
    provider
  );

  DaoHistoryAddress = config.contracts.rinkeby.DaoHistory;
  DaoHistory = new ethers.Contract(
    DaoHistoryAddress,
    KyberHistoryABI,
    provider
  );

  MatchingEngineHistoryAddress = config.contracts.rinkeby.MatchingEngineHistory;
  MatchingEngineHistory = new ethers.Contract(
    MatchingEngineHistoryAddress,
    KyberHistoryABI,
    provider
  );

  KyberFeeHandlerAddress = config.contracts.rinkeby.KyberFeeHandler;
  KyberFeeHandler = new ethers.Contract(
    KyberFeeHandlerAddress,
    KyberFeeHandlerABI,
    provider
  );

  KyberStakingAddress = config.contracts.rinkeby.KyberStaking;
  KyberStaking = new ethers.Contract(
    KyberStakingAddress,
    KyberStakingABI,
    provider
  );

  KyberDaoAddress = config.contracts.rinkeby.KyberDao;
  KyberDao = new ethers.Contract(KyberDaoAddress, KyberDaoABI, provider);

  const rinkeby = {
    KyberNetworkProxy: KyberNetworkProxy,
    KyberNetwork: KyberNetwork,
    KyberMatchingEngine: KyberMatchingEngine,
    KyberStorage: KyberStorage,
    NetworkHistory: NetworkHistory,
    FeeHandlerHistory: FeeHandlerHistory,
    DaoHistory: DaoHistory,
    MatchingEngineHistory: MatchingEngineHistory,
    KyberFeeHandler: KyberFeeHandler,
    KyberStaking: KyberStaking,
    KyberDao: KyberDao,
  };

  provider = ethereum.kovan.provider;

  KyberNetworkProxyAddress = config.contracts.kovan.KyberNetworkProxy;
  KyberNetworkProxy = new ethers.Contract(
    KyberNetworkProxyAddress,
    KyberNetworkProxyABI,
    provider
  );

  KyberNetworkAddress = config.contracts.kovan.KyberNetwork;
  KyberNetwork = new ethers.Contract(
    KyberNetworkAddress,
    KyberNetworkABI,
    provider
  );

  KyberMatchingEngineAddress = config.contracts.kovan.KyberMatchingEngine;
  KyberMatchingEngine = new ethers.Contract(
    KyberMatchingEngineAddress,
    KyberMatchingEngineABI,
    provider
  );

  KyberStorageAddress = config.contracts.kovan.KyberStorage;
  KyberStorage = new ethers.Contract(
    KyberStorageAddress,
    KyberStorageABI,
    provider
  );

  NetworkHistoryAddress = config.contracts.kovan.NetworkHistory;
  NetworkHistory = new ethers.Contract(
    NetworkHistoryAddress,
    KyberHistoryABI,
    provider
  );

  FeeHandlerHistoryAddress = config.contracts.kovan.FeeHandlerHistory;
  FeeHandlerHistory = new ethers.Contract(
    FeeHandlerHistoryAddress,
    KyberHistoryABI,
    provider
  );

  DaoHistoryAddress = config.contracts.kovan.DaoHistory;
  DaoHistory = new ethers.Contract(
    DaoHistoryAddress,
    KyberHistoryABI,
    provider
  );

  MatchingEngineHistoryAddress = config.contracts.kovan.MatchingEngineHistory;
  MatchingEngineHistory = new ethers.Contract(
    MatchingEngineHistoryAddress,
    KyberHistoryABI,
    provider
  );

  KyberFeeHandlerAddress = config.contracts.kovan.KyberFeeHandler;
  KyberFeeHandler = new ethers.Contract(
    KyberFeeHandlerAddress,
    KyberFeeHandlerABI,
    provider
  );

  KyberStakingAddress = config.contracts.kovan.KyberStaking;
  KyberStaking = new ethers.Contract(
    KyberStakingAddress,
    KyberStakingABI,
    provider
  );

  KyberDaoAddress = config.contracts.kovan.KyberDao;
  KyberDao = new ethers.Contract(KyberDaoAddress, KyberDaoABI, provider);

  const kovan = {
    KyberNetworkProxy: KyberNetworkProxy,
    KyberNetwork: KyberNetwork,
    KyberMatchingEngine: KyberMatchingEngine,
    KyberStorage: KyberStorage,
    NetworkHistory: NetworkHistory,
    FeeHandlerHistory: FeeHandlerHistory,
    DaoHistory: DaoHistory,
    MatchingEngineHistory: MatchingEngineHistory,
    KyberFeeHandler: KyberFeeHandler,
    KyberStaking: KyberStaking,
    KyberDao: KyberDao,
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
