const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword
} = require('../controllers/userController');

const { 
  authenticatUser,
  authorizePermissions
} = require('../middleware/authentication');

router.route('/').get([authenticatUser, authorizePermissions('admin')], getAllUsers);
router.route('/updateUser').patch(authenticatUser, updateUser);
router.route('/updateUserPassword').patch(authenticatUser, updateUserPassword);
router.route('/:id').get(authenticatUser, getSingleUser);

module.exports = router;