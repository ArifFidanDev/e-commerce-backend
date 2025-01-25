const express = require('express');
const router = express.Router();

const {
   signup,
   login,
   logout,
   forgotPassword,
   passwordReset,
   getLoggedInDetails,
   changePassword,
   updateUser,
   admin,
   adminGetOneUser,
   manager,
   adminUpdateOneUser,
   adminDeleteOneUser,
} = require('../controller/userController');

const { isLoggedIn,customRole } = require('../middleware/user');


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/userdashboard').get( isLoggedIn, getLoggedInDetails);
router.route('/password/update').post( isLoggedIn, changePassword);
router.route('/userdashboard/update').post( isLoggedIn, updateUser);

// admin
router.route('/admin/users').get( isLoggedIn, customRole('admin'), admin);
router.route('/admin/users/:id').get( isLoggedIn, customRole('admin'), adminGetOneUser);
router.route('/admin/users/:id').put( isLoggedIn, customRole('admin'), adminUpdateOneUser);
router.route('/admin/users/:id').delete( isLoggedIn, customRole('admin'), adminDeleteOneUser);
// manager
router.route('/manager/users').get( isLoggedIn, customRole('manager'), manager);

module.exports = router;