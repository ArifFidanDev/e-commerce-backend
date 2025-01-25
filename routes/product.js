const express = require('express');
const router = express.Router();
const { 
   addProduct,
   getAllProducts,
   getSingleProduct,
   getAdminAllProduct,
   adminUpdateSingleProduct,
   adminDeleteSingleProduct,
   addReview,
   deleteReview,
   getOnlyReviewsForOneProduct
} = require('../controller/productController');


// bring the middlewares
const { isLoggedIn,customRole } = require('../middleware/user');

// user routes
router.route('/products').get(getAllProducts);
router.route('/products/:id').get(getSingleProduct);
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/products/:id').get( isLoggedIn, getOnlyReviewsForOneProduct);

// admin routes
router.route('/admin/products/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), getAdminAllProduct);

router
   .route('/admin/product/:id')
   .put(isLoggedIn, customRole('admin'), adminUpdateSingleProduct)
   .delete(isLoggedIn, customRole('admin'), adminDeleteSingleProduct);

module.exports = router;

