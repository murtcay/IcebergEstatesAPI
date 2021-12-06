const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword
} = require('../controllers/userController');

const { authenticatUser } = require('../middleware/authentication');

router.route('/').get(authenticatUser, getAllUsers);
router.route('/updateUser').patch(updateUser);
router.route('/updateUserPassword').patch(updateUserPassword);
router.route('/:id').get(authenticatUser, getSingleUser);

module.exports = router;