const mongoose = require('mongoose');
const validator = require('validator');
// encrption for password
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const crypto = require('crypto');

// User model
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please procide a name'],
      maxlength: [30, 'Name should be under 30 characters'],
   },
   email: {
      type: String,
      required: [true, 'Please procide a mail address'],
      validate: [validator.isEmail, 'Please enter your mail in correct format'],
      unique: true,
   },
   password: {
      type: String,
      required: [true, 'Please provide your password'],
      minlength: [6, 'password must be at least 6 character'],
      select: false,
   },
   role: {
      type: String,
      default: 'user',
   },
   photo:{
      id: {
         type: String,
         required: true,
      },
      secure_url:{
         type: String,
         required: true,
      },
   },
   forgotPasswordToken: String,
   forgotPasswordExpiry: Date,
   createdAt:{
      type: Date,
      default: Date.now,
   },
});

//encrypt password before save -- HOOK
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')){
      return next();
   };
   this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with passed on user password
userSchema.methods.IsValidatedPassword = async function(usersendPassword){
  return await bcrypt.compare(usersendPassword, this.password);
};

// create and return JWT token
userSchema.methods.getJwtToken = function() {
  return JWT.sign({id: this._id}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
   });
}

// forgot password token here (string)
userSchema.methods.getForgotPasswordToken = function() {
   // generate a long random string
   const forgotToken = crypto.randomBytes(20).toString('hex');
   // getting a hash -- make sure to get a hash on backend
   this.forgotPasswordToken = crypto
   .createHash('sha256')
   .update(forgotToken)
   .digest('hex');

   // time for token for 20 minutes
   this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

   return forgotToken;
}

module.exports = mongoose.model('User', userSchema);
