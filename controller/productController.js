const Product = require('../models/product');
const BigPromise = require('../middleware/bigPromise');
const customError = require('../utils/customError');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');
const bigPromise = require('../middleware/bigPromise');
const User = require('../models/user');


exports.addProduct = BigPromise(async (req, res ,next) => {
   // images

   let imagesArray = []

   if(!req.files){
      return next(new customError('images are requied', 401));
   }

   if(req.files){
      for (let index = 0; index < req.files.photos.length; index++) {
         let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
            folder: "products"
         });

         imagesArray.push({
            id: result.public_id,
            secure_url: result.secure_url
         });
      }
   }

   req.body.photos = imagesArray;
   // this can only be accesible who's logged in already
   req.body.user = req.user.id;

   const product= await Product.create(req.body);

   res.status(200).json({
      success: true,
      product,
   });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
   const resultperPage = 6;
   // calculate total product
   const totalProductNumber = await Product.countDocuments();

   const productsObj = new WhereClause(Product.find(), req.query) // (base,bigQ)
      .search()
      .filter()
   let products = await productsObj.base
   // calculate filtered product number
   const filteredProductNumber = products.length;


   productsObj.pager(resultperPage);
   products = await productsObj.base.clone();

   if(products.length === 0){
      return next(new customError('There is no product available', 404));
   }

   
   res.status(200).json({
      success: true,
      products,
      totalProductNumber,
      filteredProductNumber
   });

});

exports.getSingleProduct = BigPromise(async(req, res, next) => {
   // grab product id from url
   const product = await Product.findById(req.params.id);

   if(!product){
      return next(new customError('The product could not find', 404));
   };

   res.status(200).json({
      success: true,
      product,
   });

});

exports.addReview = BigPromise(async (req, res, next) => {
   const {rating, comment, productId}= req.body;

   const newReview = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
   };

   // find product
   const product = await Product.findById(productId);

   if(!product){
      return next(new customError('Product Could not find!',404));
   };

   const alreadyReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
   );

   if(alreadyReview){
      product.reviews.forEach((newReview) =>{
         if(newReview.user.toString() === req.user._id.toString()){
            newReview.comment = comment;
            newReview.rating = rating;
         }
      });
   } else{
      product.reviews.push(newReview);
      product.numberOfReviews = product.reviews.length;
   }

   product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) /
   product.reviews.length;

   await product.save({validateBeforeSave: false});

   res.staus(200).json({
      success: true
   });

});

exports.deleteReview = BigPromise(async (req, res, next) => {
   const {productId} = req.query;

   const product = await Product.findById(productId);

   const reviews = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
   )

   // update
   const numberOfReviews = reviews.length;

   // calculate rating 
   product.ratings = 
   product.reviews.reduce((acc, item) => item.rating + acc, 0) /
   product.reviews.length;

   // update the product
   await Product.findByIdAndUpdate(productId, {
      reviews,
      ratings,
      numberOfReviews,
   }, {
      new: true,
      runValidators: true,
   });

   res.status(200).json({
      success: true,
   });

});

exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
   const product = await Product.findById(req.query.id)

   res.status(200).json({
      success: true,
      reviews: product.reviews
   });

});

exports.getAdminAllProduct = BigPromise(async(req, res,next) =>{
   const products = await Product.find();

   if(!products.length){
      return next(new customError('No product available',404));
   };

   res.status(200).json({
      success: true,
      products,
      totalProducts: products.length,
   });
});

exports.adminUpdateSingleProduct = BigPromise(async(req, res, next) => {
   // grab product
   let product = await Product.findById(req.params.id);

   if(!product){
      return next(new customError('No product find', 404));
   };

   let = imagesArray = [];

   // check also photos
   if(req.files){
      // delete the old ones
      for (let i = 0; i < product.photos.length; i++) {
         const res = await cloudinary.v2.uploader.destroy(product.photos[i].id);
         
      }

      //add new ones
      for (let i = 0; i < req.files.photos.length; i++) {
         let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
            folder: 'product',
         });

         imageArray.push({
            id: result.public_id,
            secure_url: result.secure_url,
         });
      }   
   }

   req.body.photos = imagesArray

   // update
   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   });

   res.status(200).json({
      success: true,
      product,
   });

});

exports.adminDeleteSingleProduct = BigPromise(async (req, res, next) =>{
   const productId = req.params.id;
   const product = await Product.findById(productId);

   if(!product){
      return next(new customError('Product could not find', 404));
   }

   // delete photos
   for (let i = 0; i < product.photos.length; i++) {
       await cloudinary.v2.uploader.destroy(product.photos[i].id);
   };

   //remove from db
    await product.deleteOne();

   res.status(200).json({
      success: true,
      message: `The product ${product.name} was deleted succesfully!`,
   })
});