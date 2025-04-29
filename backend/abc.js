const axios = require('axios');
const crypto = require('crypto');

const consumerKey = 'ck_08f15330baac920b660b8633bc1ae4caf32dcfd9';
const consumerSecret = 'cs_ccdb61397466a41fcfaf36bcc88f9d2620b1a79b';

const requestUrl = 'http://my-woocommerce-site.local/wp-json/wc/v3/products';
const method = 'POST';

const oauthParams = {
  oauth_consumer_key: consumerKey,
  oauth_nonce: crypto.randomBytes(16).toString('hex'),
  oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_version: '1.0',
};

// -- Only sign oauth params (NOT the request body) --
function normalizeParams(params) {
  return Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function createBaseString(method, url, params) {
  return [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(normalizeParams(params))
  ].join('&');
}

function generateOAuthSignature(params, url) {
  const baseString = createBaseString(method, url, params);
  const signingKey = `${encodeURIComponent(consumerSecret)}&`; // No token_secret
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(baseString);
  return hmac.digest('base64');
}

oauthParams.oauth_signature = generateOAuthSignature(oauthParams, requestUrl);

function buildAuthHeader(params) {
  return 'OAuth ' + Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`)
    .join(', ');
}

const requestData = {
    name: 'product2',
    type: 'simple',
    regular_price: '23',
    description: 'simple product description',
  };

const config = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': buildAuthHeader(oauthParams)
  }
};

axios.post(requestUrl, requestData, config)
  .then(res => console.log(res.data))
  .catch(err => console.log('Error:', err.response?.data || err.message));
