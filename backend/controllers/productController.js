const { Product } = require('../models');
const woocommerce = require('../config/woocommerce');
const axios = require('axios');
const crypto = require('crypto');

const createProduct = async (req, res) => {
  
  const { name, description, price } = req.body;
  if (!name || !description || !price) {
    return res.status(400).json({ message: 'Name, description, and price are required.' });
  }
  const userId = req.user.userId;
  // File path for local image
  const imageUrl = `/images/${req?.file?.filename}`;;

  try {
    // const product = await Product.create({
    //   userId,
    //   name,
    //   description,
    //   price,
    //   imageUrl: imageUrl // Save relative URL
    // });

    // WooCommerce sync with local server URL
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    const requestUrl = `${process.env.WOOCOMMERCE_URL}/products`;
    const method = 'POST';

    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
    };

    const normalizeParams = params => {
      return Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    };

    const createBaseString = (method, url, params) => {
      return [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(normalizeParams(params)),
      ].join('&');
    };

    const generateOAuthSignature = (params, url) => {
      const baseString = createBaseString(method, url, params);
      const signingKey = `${encodeURIComponent(consumerSecret)}&`;
      return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    };

    oauthParams.oauth_signature = generateOAuthSignature(oauthParams, requestUrl);

    const buildAuthHeader = params => {
      return 'OAuth ' + Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`)
        .join(', ');
    };

    // WooCommerce product data
    const wooData = {
      name,
      type: 'simple',
      regular_price: price.toString(),
      description,
      // images: [{ src: `${process.env.BASE_URL}${imageUrl}` }],
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': buildAuthHeader(oauthParams),
      },
    };

    // Send to WooCommerce
    // await axios.post(requestUrl, wooData, config);
    const wooCommerceProduct = await axios.post(requestUrl, wooData, config);
    
    const product = await Product.create({
      userId,
      name,
      description,
      price,
      woocommerceId:wooCommerceProduct?.data?.id,
      imageUrl: imageUrl,
      status:'Synced'

    });

    res.status(201).json(product);
  } catch (err) {
    console.log('e---------------------------',err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProducts = async (req, res) => {
  const userId = req.user.userId;
  try {
    const products = await Product.findAll({ where: { userId } });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price } = req.body;
  const userId = req.user.userId;
  const product = await Product.findOne({ where: { productId, userId } });
  try {
    // const product = await Product.findOne({ where: { productId, userId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update({ name, description, price });
    // WooCommerce sync setup

    try {
      const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    const requestUrl = `${process.env.WOOCOMMERCE_URL}/products/${product?.woocommerceId}`;
    const method = 'PUT';

    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
    };

    const normalizeParams = params => {
      return Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    };

    const createBaseString = (method, url, params) => {
      return [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(normalizeParams(params)),
      ].join('&');
    };

    const generateOAuthSignature = (params, url) => {
      const baseString = createBaseString(method, url, params);
      const signingKey = `${encodeURIComponent(consumerSecret)}&`;
      return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    };

    oauthParams.oauth_signature = generateOAuthSignature(oauthParams, requestUrl);

    const buildAuthHeader = params => {
      return 'OAuth ' + Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`)
        .join(', ');
    };

    const wooData = {
      name,
      regular_price: price.toString(),
      description,
      // images skipped
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': buildAuthHeader(oauthParams),
      },
    };
    // Send PUT request to WooCommerce
    await axios.put(requestUrl, wooData, config);
    await product.update({ status: 'Synced'});
    } catch (error) {
    }
    
    // res.status(201).json(product);
    res.status(200).json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    await product.update({ status: 'Sync Failed' });
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  try {
    const product = await Product.findOne({ where: { productId, userId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // WooCommerce delete setup
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    // const requestUrl2 = `${process.env.WOOCOMMERCE_URL}/products/${product?.woocommerceId}`;
    const requestUrl = `${process.env.WOOCOMMERCE_URL}/products/${product?.woocommerceId}`;
    const method = 'DELETE';

    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
    };

    const normalizeParams = params => {
      return Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    };

    const createBaseString = (method, url, params) => {
      return [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(normalizeParams(params)),
      ].join('&');
    };

    const generateOAuthSignature = (params, url) => {
      const baseString = createBaseString(method, url, params);
      const signingKey = `${encodeURIComponent(consumerSecret)}&`;
      return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    };

    oauthParams.oauth_signature = generateOAuthSignature(oauthParams, requestUrl.split('?')[0]);

    const buildAuthHeader = params => {
      return 'OAuth ' + Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`)
        .join(', ');
    };

    const wooData = {
      force: true
    };

    const config = {
      headers: {
        'Authorization': buildAuthHeader(oauthParams),
      },
    };

    // Send DELETE request to WooCommerce
    await axios.delete(requestUrl, {
      headers: {
        'Authorization': buildAuthHeader(oauthParams),
      },
      data: wooData
    });

    // Delete from DB
    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};


module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
