const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
require('dotenv').config();

const woocommerceBaseURL = process.env.WOOCOMMERCE_URL;

const oauth = OAuth({
  consumer: {
    key: process.env.WOOCOMMERCE_CONSUMER_KEY,
    secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const woocommerce = axios.create({
  baseURL: woocommerceBaseURL,
});

woocommerce.interceptors.request.use(config => {
  const requestData = {
    url: config.baseURL + config.url,
    method: config.method,
  };
  config.headers = {
    ...config.headers,
    ...oauth.toHeader(oauth.authorize(requestData)),
  };
  return config;
});

module.exports = woocommerce;
