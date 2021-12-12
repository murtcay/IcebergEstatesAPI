const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

const { 
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');

router.route('/').get(authenticateUser, getAllAppointments);
router.route('/').post(authenticateUser, authorizePermissions('user'), createAppointment);
router.route('/:id').get(authenticateUser, getSingleAppointment);
router.route('/:id').patch(authenticateUser, updateAppointment);
router.route('/:id').delete(authenticateUser, deleteAppointment);


module.exports = router;