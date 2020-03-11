const fs = require('fs');
const Web3 = require('web3');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));

const mainnet = new Web3(new Web3.providers.HttpProvider(`${config.web3.mainnet}/${process.env.NODE_KEY}`));
const ropsten = new Web3(new Web3.providers.HttpProvider(`${config.web3.ropsten}/${process.env.NODE_KEY}`));
const rinkeby = new Web3(new Web3.providers.HttpProvider(`${config.web3.rinkeby}/${process.env.NODE_KEY}`));
const kovan = new Web3(new Web3.providers.HttpProvider(`${config.web3.kovan}/${process.env.NODE_KEY}`));

const ethereum = {
  mainnet,
  ropsten,
  rinkeby,
  kovan,
};

module.exports = ethereum;
