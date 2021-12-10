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
  authenticatUser
} = require('../middleware/authentication');

router.route('/').get(authenticatUser, getAllAppointments);
router.route('/').post(authenticatUser, createAppointment);
router.route('/:id').get(authenticatUser, getSingleAppointment);
router.route('/:id').patch(authenticatUser, updateAppointment);
router.route('/:id').delete(authenticatUser, deleteAppointment);


module.exports = router;