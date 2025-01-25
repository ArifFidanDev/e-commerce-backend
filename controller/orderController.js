const Order = require('../models/order');
const Product = require('../models/product');
const BigPromise = require('../middleware/bigPromise');
const bigPromise = require('../middleware/bigPromise');
const customError = require('../utils/customError');

exports.createOrder = BigPromise(async(req, res, next) => {
   const {
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
   } = req.body;

   const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
      user: req.user._id,
   });

   res.status(200).json({
      success: true,
      order,
   });
});

exports.getOneOrder = BigPromise(async (req, res, next) =>{
   // grab the order by id 
   const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
   );

   if(!order){
      return next(new customError('Order could not found',401));
   }

   res.status(200).json({
      success: true,
      order,
   });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) =>{
   const order = await Order.find({user: req.user._id});

   if(!order){
      return next(new customError('Order could not found',401));
   }

   res.status(200).json({
      success: true,
      order,
   });

});

// admin controllers
exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
   // grab all orders
   const order = await Order.find();

   if(order.length === 0){
      return next(new customError('No orders found',401));
   }

   res.status(200).json({
      success: true,
      order,
   });
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
   const orderId = req.params.id;
   const order = await Order.findById(orderId);

   if(!order){
      return next(new customError('something went wrong with the order!', 401));
   }

   if(order.orderStatus === 'delivered'){
      return next(new customError('Order is already delivered!', 401));
   }

   // update the field
   order.orderStatus = req.body.orderStatus

   if(req.body.status === 'delivered'){
      order.orderStatus.foreach(async prod =>{
         await updateStock(prod.product, prod.quantity);
      });
   }

   await order.save();

   res.status(200).json({
      success: true,
      order,
   })
});

exports.adminDeleteOrder = BigPromise(async(req, res, next) => {
   const order = await Order.findById(req.params.id);

   if(!order){
      return next(new customError('something went wrong by deleting process', 401));
   }

   // delete
   await order.deleteOne();

   res.status(200).json({
      success: true,
      message: 'The order deleted succesfully!',
   });
});

async function updateStock(productId, quantity){
   const product = await Product.findById(productId);

   product.stock = product.stock - quantity;
   await product.save();
}; 
