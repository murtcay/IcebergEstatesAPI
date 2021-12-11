const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Appointment = require('../models/Appointments');
const Contact = require('../models/Contact');

const {
  checkPermissions
} = require('../utils');

const {
  getDistanceAndTime,
  getLatitudeLongitude,
  postcodeValidate
} = require('../utils/location');

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
    
    await postcodeValidate(postcode);

    // Get Appointment Customer Contact Information
    const customerContact = await getAppointmentCustomerContactInfo({
      customer: { first_name, last_name, email, phone }
    });

    if(!customerContact.status) {
      throw new CustomError.BadRequestError(customerContact.error)
    }

    // Appointment Creation Part, working on the scenario 

    const lastAppointmentInGivenDate = await Appointment.find({date: new Date(date)})
      .sort('-estimatedAvailableTime')
      .limit(1);

    let lastAvailableTime = null;

    if(!lastAppointmentInGivenDate || !lastAppointmentInGivenDate.length){
      lastAvailableTime = new Date(Date.now()).getTime()
    }
    else {
      lastAvailableTime = lastAppointmentInGivenDate.getTime();
    }

    const locationString = await getLatitudeLongitude(['cm27pj', postcode]);

    const office = locationString['cm27pj'].split(',').join('%2C');
    const appointmentPlace = locationString[postcode].split(',').join('%2C');

    const offsetTime = 15 * 60; // 15 minutes;
    const leaveTimeFromOffice = offsetTime + Math.floor( lastAvailableTime / 1000); // time in seconds
    const appointmentDuration = 60 * 60; // 1 hour in seconds

    const departure = await getDistanceAndTime({ 
      origin: office, 
      destination: appointmentPlace, 
      departureTime: leaveTimeFromOffice
    });

    const arrival = await getDistanceAndTime({
      origin: appointmentPlace,
      destination: office,
      departureTime: (leaveTimeFromOffice + departure.duration + appointmentDuration)
    });

    const availableTimeAtOffice = (leaveTimeFromOffice + departure.duration + appointmentDuration + arrival.duration);

    const appointment = await Appointment.create({
      address,
      date: new Date(date),
      creator: req.user.userId,
      customer: customerContact.contact._id,
      distance: departure.distance.text,
      estimatedLeaveTime: new Date(leaveTimeFromOffice*1000),
      estimatedAvailableTime: new Date(availableTimeAtOffice*1000)
    });

    res.status(200).json({
      lastAvailableTime,
      locationString,
      office,
      appointmentPlace,
      leaveTimeFromOffice,
      availableTimeAtOffice,
      departure,
      arrival,
      appointment
    });
 };

const getAllAppointments = async (req, res) => { 
  const queryObj = {};

  if(req.user.role !== 'admin') {
    queryObj.creator = req.user.userId;
  }

  const appointments = await Appointment.find(queryObj).populate('customer');

  res.status(StatusCodes.OK).json({ appointments });
};

const getSingleAppointment = async (req, res) => { 

  const appointment = await Appointment.findOne({_id: req.params.id}).populate('customer');

  if(!appointment) {
    throw new CustomError.BadRequestError(`No appointment with id: ${req.params.id}`);
  }

  checkPermissions(req.user, appointment.creator);
  res.status(StatusCodes.OK).json({ appointment });
};

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