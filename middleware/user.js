const User = require('../models/user');
const BigPromise = require('../middleware/bigPromise');
const customError = require('../utils/customError');
const JWT = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async(req, res, next) =>{
   // grab the token 
   const token = req.cookies.token || req.header('authorization').replace("Bearer ","");

   if(!token){
      return next(new customError('Login first to accces this page', 401));
   }

   const decoded = JWT.verify(token, process.env.JWT_SECRET);

   req.user = await User.findById(decoded.id);

   next();

});

exports.customRole = (...roles) => {
   return(req, res, next) => {
      if(!roles.includes(req.user.role)){
         return next(new customError('not allowed for access!', 403));
      }
      next();
   };
};

 