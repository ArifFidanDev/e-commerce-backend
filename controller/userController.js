const User = require('../models/user');
const BigPromise = require('../middleware/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const customError = require('../utils/customError');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');


exports.signup = BigPromise(async (req, res, next) => {

   // sending image
   if(!req.files){
      return next(new customError('photo is required for signup', 400));
   };

   // destructure needies
   const {name, email, password} = req.body;

   if(!email || !name || !password) {
      return next(new CustomError('Name, email and password are required',400));
   }

   let file = req.files.photo;

   const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
   });

   const user = await User.create({
      name,
      email,
      password,
      photo: {
         id: result.public_id,
         secure_url: result.secure_url,
      },
   });

//  sending cookie token here
   cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
   // destructure
   const {email, password} = req.body;

   // check for presence email and password
   if(!email || !password){
      return next(new customError('Please provide email and password!'), 400);
   };

   // get user from DB
   const user = await User.findOne({email}).select("+password");

   if(!user){
      return next(new customError('User Cannot Found!'),400);
   };

   // match the password
   const isPasswordCorrect = await user.IsValidatedPassword(password);
   
   // if password do not match
   if(!isPasswordCorrect){
      return next(new customError('Incorrect Password!'),400);
   };

   cookieToken(user, res);
   
});

exports.logout = BigPromise(async (req, res, next) => {
   res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
   });
   res.status(200).json({
      success: true,
      message: 'logout success',
   });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
   // grab email
   const {email} = req.body;
   // check the mail and keep in a var
   const user = await User.findOne({email});

   if(!user){
      return next(new customError('Email not found as registered',404));
   };

   // for reset password
   const forgotToken = user.getForgotPasswordToken();

   await user.save({validateBeforeSave: false});

   const forgotUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

   const message = `copy paste this link in your URL an hit enter \n\n ${forgotUrl}`;

   try {
      await mailHelper({
         email: user.email,
         subject: " T-shirt store - password reset email",
         message,
      });

      res.status(200).json({
         success: true,
         message: "e-mail sent succesfully",
      });

   } catch (error) {
      // clear tokens
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      await user.save({validateBeforeSave: false});

      return next(new customError(error.message, 500));
   }

});

exports.passwordReset = BigPromise(async (req, res, next) => {
   const token = req.params.token;

   // hash the token
   const encryToken = crypto
   .createHash("sha256")
   .update(token)
   .digest("hex");

   // find the user with the token and check its not expired
   const user = await User.findOne({
      forgotPasswordToken: encryToken,
      forgotPasswordExpiry: {$gt: Date.now()}
   })

   if(!user){
      return next(new customError('Token is invalid or expired', 400));
   };

   if(req.body.password !== req.body.confirmPassword){
      return next(new customError('password and confirm password does not match', 400));
   };

   user.password = req.body.password;

   forgotPasswordToken = undefined;
   forgotPasswordExpiry = undefined;

   await user.save();

   cookieToken(user, res);
});

exports.getLoggedInDetails = BigPromise(async (req, res, next) => {

   // grab a user
   const user = await User.findById(req.user.id);

   res.status(200).json({
      success: true,
      user,
   });
});

exports.changePassword = BigPromise(async (req, res, next) => {

   const userId = req.user.id

   const user = await User.findById(userId).select("+password");

   if(!user){
      return next(new customError('User cannot found', 404));
   }

   const isCorrectOldPassword = await user.IsValidatedPassword(req.body.oldPassword)

   if(!isCorrectOldPassword){
      return next(new customError('old password is incorrect', 400));
   }

   user.password = req.body.newPassword;

   await user.save();

   // update the token
   cookieToken(user, res);

});

exports.updateUser = BigPromise(async (req, res, next) => {
   const userId = req.user.id;

   newData = {
      name: req.body.name,
      email: req.body.email
   };

   if(req.files){
      const user = await User.findById(userId);

      const imageId = user.photo.id;
      // delete photo
      const resp = await cloudinary.v2.uploader.destroy(imageId);
      // upload the new one
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
         folder: 'users',
         width: 150,
         crop: 'scale'
      });

      newData.photo  = {
         id: result.public_id,
         secure_url: result.secure_url
      }
   }

   const user = await User.findByIdAndUpdate(userId, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
   })

   res.status(200).json({
      success: true,
      user,
   });
});

exports.admin = BigPromise(async (req, res, next) => {
   const users = await User.find()

   res.status(200).json({
      success: true,
      users
   });
});

exports.manager = BigPromise(async (req, res, next) => {
   const users = await User.find({role: 'user'});

   res.status(200).json({
      success: true,
      users
   });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
   const user = await User.findById(req.params.id);
 
   if(!user){
    return next(new customError('User not exist', 400));
   }
 
   res.status(200).json({
    success: true,
    user
   });
 })

 exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
   newData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role
   };

   // check the existing the fields
   if(!req.body.name || !req.body.email || !req.body.role){
      return next(new customError('Please provide name, email and role for updating the user!', 400));
   }

   const user = await User.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
   })

   if (!user) {
      return next(new customError('User not found', 404));
   }

   res.status(200).json({
      success: true,
      user,
   });
});

 exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
   const  user = await User.findById(req.params.id);

   if(!user){
      return next(new customError('User not exist', 401));
   }

   // grab image id
   const imageId = user.photo.id

   // delete photo
   await cloudinary.v2.uploader.destroy(imageId);

   await user.deleteOne();

   res.status(200).json({
      success: true
   });

});
