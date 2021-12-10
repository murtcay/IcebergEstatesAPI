const mongoose = require('mongoose');
const validator = require('validator');

const ContactSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Please provide a first name'],
    minlength:3,
    maxlength: 50
  }, 
  last_name: {
    type: String,
    required: [true, 'Please provide a last name'],
    minlength:3,
    maxlength: 50
  }, 
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
    validate: {
      validator:validator.isEmail,
      message: 'Please provide a valid email.'
    }
  },
  phone: {
    type: String,
    unique: true,
    required: [true, 'Please provide an phone'],
  }
});

ContactSchema.methods.informationCheck = function (candidateInfo, key) {
  const isMatch = candidateInfo === this[key];
  return isMatch;
}

module.exports = mongoose.model('Contact', ContactSchema);