// bring the func
const BigPromise = require('../middleware/bigPromise');


exports.home =  BigPromise( async  (req, res) => {
   // const db = await something();
   res.status(200).json({
      success: true,
      greeting: 'Hello From API',
   });
});

exports.homeDummy = (req, res) => {
   res.status(200).json({
      success: true,
      greeting: 'This is another dummy route',
   });
};