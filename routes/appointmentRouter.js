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
  authenticatUser,
  authorizePermissions
} = require('../middleware/authentication');

router.route('/').get(authenticatUser, getAllAppointments);
router.route('/').post(authenticatUser, authorizePermissions('user'), createAppointment);
router.route('/:id').get(authenticatUser, getSingleAppointment);
router.route('/:id').patch(authenticatUser, updateAppointment);
router.route('/:id').delete(authenticatUser, deleteAppointment);


module.exports = router;