const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Please provide an address.']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date.']
  },
  creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  distance: {
    type: String,
    required: [true, 'Please provide distance.']
  },
  estimatedArrivalTime: {
    type: Date,
    required: true
  },
  estimatedDepartureTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'cancelled', 'expired', 'realised'],
    default: 'pending'
  },
  createdAt : {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);