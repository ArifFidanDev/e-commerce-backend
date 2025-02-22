const express = require('express');
const {
   createOrder,
   getOneOrder,
   getLoggedInOrders,
   adminGetAllOrders, 
   adminUpdateOrder,
   adminDeleteOrder
} = require('../controller/orderController');
const router = express.Router();
const {isLoggedIn, customRole} = require('../middleware/user');

// routes
router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/:id').get(isLoggedIn, getOneOrder);
router.route('/myorder').get(isLoggedIn, getLoggedInOrders);

// admin routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), adminGetAllOrders);
router.route('/admin/order/:id').put(isLoggedIn, customRole('admin'), adminUpdateOrder);
router.route('/admin/order/:id').delete(isLoggedIn, customRole('admin'), adminDeleteOrder);

module.exports = router;
