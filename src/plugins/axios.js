const Axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('src/config/default.json', 'utf8'));

const axios = Axios.create({
  baseURL: config.axios.baseURL,
  timeout: config.axios.timeout,
});

module.exports = axios;
