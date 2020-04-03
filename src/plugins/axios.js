const Axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));

const kyber = Axios.create({
  baseURL: config.axios.kyber.baseURL,
  timeout: config.axios.kyber.timeout,
});
const ethgasstation = Axios.create({
  baseURL: config.axios.ethgasstation.baseURL,
  timeout: config.axios.ethgasstation.timeout,
});
const feargreedindex = Axios.create({
  baseURL: config.axios.feargreedindex.baseURL,
  timeout: config.axios.feargreedindex.timeout,
});

const axios = {
  kyber,
  ethgasstation,
  feargreedindex,
};

module.exports = axios;
