const { ethers }  = require('ethers');
const ETHERSCAN_WEIGHT = 1;
const INFURA_WEIGHT = 5;
const ALCHEMY_WEIGHT = 20;
const MAINNET_QUORUM = 2;
const DEFAULT_QUORUM = 1;

function genInfuraProvider(network) {
  return {
    provider: new ethers.providers.InfuraProvider(
      network,
      process.env.INFURA_KEY
    ),
    priority: INFURA_WEIGHT,
    stallTimeout: 1000,
    weight: INFURA_WEIGHT
  };
};

function genAlchemyProvider(network) {
  return {
    provider: new ethers.providers.AlchemyProvider(
      network,
      process.env.ALCHEMY_KEY
    ),
    priority: ALCHEMY_WEIGHT,
    stallTimeout: 1000,
    weight: ALCHEMY_WEIGHT
  };
}

function genEtherscanProvider(network) {
  return {
    provider: new ethers.providers.EtherscanProvider(
      network
    ),
    priority: ETHERSCAN_WEIGHT,
    stallTimeout: 1000,
    weight: ETHERSCAN_WEIGHT
  };
}

let mainnetInfuraProvider = genInfuraProvider('mainnet');
let ropstenInfuraProvider = genInfuraProvider('ropsten');
let rinkebyInfuraProvider = genInfuraProvider('rinkeby');
let kovanInfuraProvider = genInfuraProvider('kovan');

let mainnetAlchemyProvider = genAlchemyProvider('mainnet');
let ropstenAlchemyProvider = genAlchemyProvider('ropsten');
let rinkebyAlchemyProvider = genAlchemyProvider('rinkeby');
let kovanAlchemyProvider = genAlchemyProvider('kovan');

let mainnetEtherscanProvider = genEtherscanProvider('mainnet');
let ropstenEtherscanProvider = genEtherscanProvider('ropsten');
let rinkebyEtherscanProvider = genEtherscanProvider('rinkeby');
let kovanEtherscanProvider = genEtherscanProvider('kovan');

const mainnet = {
  ethers,
  provider: new ethers.providers.FallbackProvider([
    mainnetInfuraProvider,
    mainnetAlchemyProvider,
    mainnetEtherscanProvider
  ], MAINNET_QUORUM)
};

const ropsten = {
  ethers,
  provider: new ethers.providers.FallbackProvider([
    ropstenInfuraProvider,
    ropstenAlchemyProvider,
    ropstenEtherscanProvider
  ], DEFAULT_QUORUM)
};

const rinkeby = {
  ethers,
  provider: new ethers.providers.FallbackProvider([
    rinkebyInfuraProvider,
    rinkebyAlchemyProvider,
    rinkebyEtherscanProvider
  ], DEFAULT_QUORUM)
};

const kovan = {
  ethers,
  provider: new ethers.providers.FallbackProvider([
    kovanInfuraProvider,
    kovanAlchemyProvider,
    kovanEtherscanProvider
  ], DEFAULT_QUORUM)
};

const ethereum = {
  mainnet,
  ropsten,
  rinkeby,
  kovan,
};

module.exports = ethereum;
