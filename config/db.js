const mongoose = require('mongoose')

const connectWithDb = () => {

   mongoose.connect(process.env.DB_URL)
   .then(console.log('DB Connected'))
   .catch(error =>{
      console.log('DB connection failed');
      console.log(error);
      process.exit(1);
   });
};

module.exports = connectWithDb