const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const app = express();

// swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
   useTempFiles: true,
   tempFileDir: "/tmp/"
}));


// just a temp check
app.set("view engine", "ejs");

// morgan middleware
app.use(morgan('tiny'));

// import all routes here
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');


// router middleware 
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order);


app.get('/signuptest', (req, res) => {
   res.render("signuptest");
});

// export the app.js

module.exports = app;