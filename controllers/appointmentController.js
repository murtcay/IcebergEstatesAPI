const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Contact = require('../models/Contact');

const createAppointment = async (req, res) => { 
    const {
      address, 
      date, 
      first_name, 
      last_name, 
      email, 
      phone
    } = req.body;
  
    if(!address || !date || !first_name || !last_name || !email || !phone) {
      throw new CustomError.BadRequestError('Please provide all values.');
    }

    // Validate a postcode
    const regEx = /^[a-zA-Z0-9]+$/;
    if(!regEx.test(address)) {
      throw new CustomError.BadRequestError('Postcode is not validx.');
    }

    const postcode = address.toLowerCase();
    
    const {data: isValidPostcode} = await axios({
      method: 'get',
      url: `${process.env.POSTCODE_API_HOST}/postcodes/${postcode}/validate`
    });
   
    if(!isValidPostcode.result) {
      throw new CustomError.BadRequestError('Postcode is not valid.');
    }

    // Get Appointment Customer Contact Information
    const customerContact = await getAppointmentCustomerContactInfo({
      customer: { first_name, last_name, email, phone }
    });

    if(!customerContact.status) {
      throw new CustomError.BadRequestError(customerContact.error)
    }

    res.status(200).json(req.body);
 

};
const getAllAppointments = async (req, res) => { res.send('Get all appointments');};
const getSingleAppointment = async (req, res) => { res.send('Get single appointment');};
const updateAppointment = async (req, res) => { res.send('Update appointment');};
const deleteAppointment = async (req, res) => { res.send('Delete appointment');};

const getAppointmentCustomerContactInfo = async ({customer}) => {
  const result = {};
  try {
    let contact = await Contact.findOne({email: customer.email});

    if(!contact) {
      contact = await Contact.findOne({phone: customer.phone});
      if(!contact) {
        result.contact = await Contact.create(customer);
        result.status = true;
      }
      else {
        throw new Error('Invalid Cutomer Credentials');
      }
    }
    else {
      let isMatch = contact.informationCheck(customer.phone, 'phone');

      if(!isMatch) {
        throw new Error('Customer credentials does not match the registered credentials.  Hint: Please check customer phone number.');
      }

      isMatch = contact.informationCheck(customer.last_name, 'last_name');
      if(!isMatch) {
        throw new Error('Customer credentials does not match the registered credentials. Hint: Please check customer name.');
      }

      isMatch = contact.informationCheck(customer.first_name, 'first_name');
      if(!isMatch) {
        throw new Error('Customer credentials does not match the registered credentials. Hint: Please check customer name.');
      }
      result.contact = contact;
      result.status= true;
    }
  } catch (error) {
    result.status = false;
    result.contact = null;
    result.error = error.message;
  }

  return result;
} ;

module.exports = {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  deleteAppointment
};