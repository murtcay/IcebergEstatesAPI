const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword
} = require('../controllers/userController');

const { 
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');

router.route('/').get([authenticateUser, authorizePermissions('admin')], getAllUsers);
router.route('/updateUser/:id').patch(authenticateUser, updateUser);
router.route('/updateUserPassword/:id').patch(authenticateUser, updateUserPassword);
router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;