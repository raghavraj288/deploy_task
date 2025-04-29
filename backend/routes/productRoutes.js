const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.single('imageUrl'), createProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:productId', authMiddleware, updateProduct);
router.delete('/:productId', authMiddleware, deleteProduct);

module.exports = router;
