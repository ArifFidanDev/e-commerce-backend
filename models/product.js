const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [80, 'Product name should not be more than 80 chareacters']
   },
   price: {
      type: Number,
      required: true,
      maxlength: [5, 'Product price should not be more than five digits']
   },
   description: {
      type: String,
      required: [true, 'Please proive description for the product'],

   },
   photos: [{
      id: {
         type: String,
         required: true,
      },
      secure_url: {
         type: String,
         required: true
      }
   }],
   category: {
      type: String,
      required: [true, 'Please select category from- short sleeves, long sleeves, sweathirts,hoodies'],
      enum: {
         values: [
            'shortsleeves',
            'longsleeves',
            'sweatshirt',
            'hoodies'
         ],
         message: 'Please select category ONLY from - short-sleeves, long-sleeves, swat-shirts,hoodies'
      }
   },
   stock: {
      type: Number,
      required: [true, 'Please specified the stock quantity'],
   },
   brand: {
      type: String,
      required: [true, 'please add a brand for clothing'],
   },
   ratings: {
      type: Number,
      default: 0
   },
   numberOfReviews: {
      type: Number,
      default: 0
   },
   reviews:[
      {
         user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
         },
         name: {
            type: String,
            required: true,
         },
         rating: {
            type: Number,
            required: true
         },
         comment: {
            type: String,
            required: true
         }
      }
   ],
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});


module.exports = mongoose.model('Product' , productSchema);