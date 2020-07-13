const ethers = require('ethers');

const mainnet = {
  ethers,
  provider: new ethers.providers.getDefaultProvider('mainnet', {
    quorum: 1,
    infura: process.env.INFURA_KEY,
    alchemy: process.env.ALCHEMY_KEY,
  }),
};
const ropsten = {
  ethers,
  provider: new ethers.providers.getDefaultProvider('ropsten', {
    quorum: 1,
    infura: process.env.INFURA_KEY,
    alchemy: process.env.ALCHEMY_KEY,
  }),
};
const rinkeby = {
  ethers,
  provider: new ethers.providers.getDefaultProvider('rinkeby', {
    quorum: 1,
    infura: process.env.INFURA_KEY,
    alchemy: process.env.ALCHEMY_KEY,
  }),
};
const kovan = {
  ethers,
  provider: new ethers.providers.getDefaultProvider('kovan', {
    quorum: 1,
    infura: process.env.INFURA_KEY,
    alchemy: process.env.ALCHEMY_KEY,
  }),
};

const ethereum = {
  mainnet,
  ropsten,
  rinkeby,
  kovan,
};

module.exports = ethereum;
