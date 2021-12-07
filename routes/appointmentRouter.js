const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

router.route('/').get(getAllAppointments);
router.route('/').post(createAppointment);
router.route('/:id').get(getSingleAppointment);
router.route('/:id').patch(updateAppointment);
router.route('/:id').delete(deleteAppointment);


module.exports = router;