const { ethers } = require('ethers');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));
const ALCHEMY_WEIGHT = config.nodes.ALCHEMY_WEIGHT;
const ETHERSCAN_WEIGHT = config.nodes.ETHERSCAN_WEIGHT;
const INFURA_WEIGHT = config.nodes.INFURA_WEIGHT;
const DEFAULT_QUORUM = config.nodes.DEFAULT_QUORUM;

function genAlchemyProvider(network) {
  return {
    provider: new ethers.providers.AlchemyProvider(
      network,
      process.env.ALCHEMY_KEY
    ),
    priority: ALCHEMY_WEIGHT,
    stallTimeout: 1000,
    weight: ALCHEMY_WEIGHT,
  };
}

function genEtherscanProvider(network) {
  return {
    provider: new ethers.providers.EtherscanProvider(network),
    priority: ETHERSCAN_WEIGHT,
    stallTimeout: 1000,
    weight: ETHERSCAN_WEIGHT,
  };
}

function genInfuraProvider(network) {
  return {
    provider: new ethers.providers.InfuraProvider(
      network,
      process.env.INFURA_KEY
    ),
    priority: INFURA_WEIGHT,
    stallTimeout: 1000,
    weight: INFURA_WEIGHT,
  };
}

const mainnetInfuraProvider = genInfuraProvider('mainnet');
const ropstenInfuraProvider = genInfuraProvider('ropsten');
const rinkebyInfuraProvider = genInfuraProvider('rinkeby');
const kovanInfuraProvider = genInfuraProvider('kovan');

const mainnetAlchemyProvider = genAlchemyProvider('mainnet');
const ropstenAlchemyProvider = genAlchemyProvider('ropsten');
const rinkebyAlchemyProvider = genAlchemyProvider('rinkeby');
const kovanAlchemyProvider = genAlchemyProvider('kovan');

const mainnetEtherscanProvider = genEtherscanProvider('mainnet');
const ropstenEtherscanProvider = genEtherscanProvider('ropsten');
const rinkebyEtherscanProvider = genEtherscanProvider('rinkeby');
const kovanEtherscanProvider = genEtherscanProvider('kovan');

const mainnet = {
  ethers,
  provider: new ethers.providers.FallbackProvider(
    [mainnetInfuraProvider, mainnetAlchemyProvider, mainnetEtherscanProvider],
    DEFAULT_QUORUM
  ),
};

const ropsten = {
  ethers,
  provider: new ethers.providers.FallbackProvider(
    [ropstenInfuraProvider, ropstenAlchemyProvider, ropstenEtherscanProvider],
    DEFAULT_QUORUM
  ),
};

const rinkeby = {
  ethers,
  provider: new ethers.providers.FallbackProvider(
    [rinkebyInfuraProvider, rinkebyAlchemyProvider, rinkebyEtherscanProvider],
    DEFAULT_QUORUM
  ),
};

const kovan = {
  ethers,
  provider: new ethers.providers.FallbackProvider(
    [kovanInfuraProvider, kovanAlchemyProvider, kovanEtherscanProvider],
    DEFAULT_QUORUM
  ),
};

const ethereum = {
  mainnet,
  ropsten,
  rinkeby,
  kovan,
};

module.exports = ethereum;
