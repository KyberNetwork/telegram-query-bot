const fs = require('fs');
const Web3 = require('web3');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));

const web3 = new Web3(new Web3.providers.HttpProvider(`${config.web3.rpcURL}/${process.env.INFURA_PROJECT_ID}`));

module.exports = web3;
