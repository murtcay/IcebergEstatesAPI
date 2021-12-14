const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Appointment = require('../models/Appointments');
const Contact = require('../models/Contact');
const OFFICE_CODE = 'cm27pj';
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
  
  let today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Validate a postcode
  const postcode = address.toLowerCase();
  const regEx = /^[a-zA-Z0-9]+$/;

  if(!regEx.test(postcode)) {
    throw new CustomError.BadRequestError('Postcode is not valid.');
  }

  await postcodeValidate(postcode);

  // Get Appointment Customer Contact Information
  const customerContact = await getAppointmentCustomerContactInfo({
    customer: { first_name, last_name, email, phone }
  });

  if(!customerContact.status) {
    throw new CustomError.BadRequestError(customerContact.error)
  }

  // Appointment Creation Part, working on the scenario 
  const calcResult = await appointmentCalculation({
    date, 
    today, 
    user:req.user, 
    appointmentId: null, 
    appointmentAdress: postcode
  });

  // Check is there a pending appointment for the customer and address
  const pendingAppointment = await Appointment.findOne({
    address: postcode,
    customer: customerContact.contact._id,
    status: 'pending'
  });
  
  if(pendingAppointment) {
    if(pendingAppointment.creator.toString() === req.user.userId.toString()) {
      throw new CustomError.BadRequestError('An appointment is already exists.');
    }
    else {
      throw new CustomError.BadRequestError('An appointment is already created by another user.');
    }
  }

  const appointment = await Appointment.create({
    address: postcode,
    date: calcResult.date,
    creator: req.user.userId,
    customer: customerContact.contact._id,
    distance: calcResult.distance,
    estimatedLeaveTime: calcResult.estimatedLeaveTime,
    estimatedAvailableTime: calcResult.estimatedAvailableTime
  });
  
  res.status(200).json({
    appointment: {
      id: appointment._id,
      address: appointment.address,
      date: appointment.date,
      customer: {
        first_name, last_name, email, phone
      },
      distance: appointment.distance,
      estimatedLeaveTime: appointment.estimatedLeaveTime,
      estimatedAvailableTime: appointment.estimatedAvailableTime
    }
  });
};

const getAllAppointments = async (req, res) => { 
  const { year:reqYear, month, date, sort } = req.query;
  const queryObj = {};
  const today = new Date();
  let dateFilter = {};

  if(reqYear){
    let year = reqYear; 
    if((year.length !== 4) || (Number(year) < 0)) {
      year = today.getFullYear();
    }
    if(month && month.length === 2 && (Number(month) < 13) && (Number(month) > 0)) {
      if(date && date.length === 2 && (Number(date) < 31) && (Number(date) > 0)) {
        if(Date.parse(`${year}-${month}-${date}`)) {
          dateFilter = {
            $eq: new Date(`${year}-${month}-${date}`)
          };
        }
      }
      else {
        if(Number(month) === 12) {
          dateFilter = {
          $gte: new Date(`${year}-${month}`),
          $lt: new Date(`${Number(year)+1}-01`)
          };
        }
        else {
          dateFilter = {
            $gte: new Date(`${year}-${month}`),
            $lt: new Date(`${year}-${Number(month)+1}`)
          };
        }
      }
    }
    else {
      dateFilter = {
        $gte: new Date(`${year}`),
        $lt: new Date(`${Number(year)+1}`)
      };
    }
  }
  else {
    if(month && month.length === 2 && (Number(month) < 13) && (Number(month) > 0)) {
      let year = today.getFullYear();
      if(date && date.length === 2 && (Number(date) < 31) && (Number(date) > 0)) {
        if(Date.parse(`${year}-${month}-${date}`)) {
          dateFilter = {
            $eq: new Date(`${year}-${month}-${date}`)
          };
        }
      }
      else {
        if(Number(month) === 12) {
          dateFilter = {
            $gte: new Date(`${year}-${month}`),
            $lt: new Date(`${Number(year)+1}-01`)
          };
        }
        else {
          dateFilter = {
            $gte: new Date(`${year}-${month}`),
            $lt: new Date(`${year}-${Number(month)+1}`)
          };
        }
      }
    }
  }

  if (Object.keys(dateFilter).length !== 0) {
    queryObj.date = dateFilter;
  }

  if(req.user.role !== 'admin') {
    queryObj.creator = req.user.userId;
  }

  let sortAvailableTime = '-estimatedAvailableTime';
  if(sort && (sort.toLowerCase() === 'asc')) {
    sortAvailableTime = 'estimatedAvailableTime';
  }

  const appointments = await Appointment.find(queryObj)
    .populate('customer', '-_id first_name last_name email phone')
    .select('-creator -createdAt -__v')
    .sort(sortAvailableTime);

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

const updateAppointment = async (req, res) => { 
  const { date, status } = req.body;
  const {id: appointmentId} = req.params;
  let today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  
  const appointment = await Appointment.findById(appointmentId)
    .populate('customer', '-_id first_name last_name email phone')
    .select('-creator -createdAt -__v');
  
  if(!appointment) {
    throw new CustomError.BadRequestError(`No appointment with id: ${appointmentId}`);
  }
  
  if(status && !date) {
    if(appointment.status === 'pending') {
      appointment.status = status;
      await appointment.save();
    }
    else {
      throw new CustomError.BadRequestError('Unable to update the status. Please create a new appointment.');
    }
  }
  else if (!status && date) {
    
    const calcResult = await appointmentCalculation({
      date, 
      today, 
      user:req.user, 
      appointmentId: appointment._id, 
      appointmentAdress: appointment.address.toLowerCase()
    });
   
    appointment.status = 'pending';
    appointment.date = calcResult.date;
    appointment.distance = calcResult.distance;
    appointment.estimatedLeaveTime = calcResult.estimatedLeaveTime;
    appointment.estimatedAvailableTime = calcResult.estimatedAvailableTime;
    await appointment.save();
  }
  else {
    throw new CustomError.BadRequestError('Please provide only appointment status or new date.');
  }

  res.status(StatusCodes.OK).json({ appointment });
};

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

const appointmentCalculation = async ({date, today, user, appointmentId, appointmentAdress}) => {

  if(isNaN(new Date(date).getTime())) {
    throw new CustomError.BadRequestError('Invalid date format. Format must be yyyy-mm-dd');
  }

  const appointmentDate = new Date(date);

  if(appointmentDate.getTime() < today.getTime()) {
    throw new CustomError.BadRequestError('You cannot change the appointment date with a past date.');
  }
  
  const lastAppointmentInGivenDate = await Appointment.find({
    date: appointmentDate,
    creator: user.userId
  }).sort('-estimatedAvailableTime').limit(1);
  
  let lastAvailableTime = null;
  const shiftBegin = `${date}T08:00:00.000Z`;
  const shiftEnd = `${date}T23:59:59.000Z`;
  
  if(!lastAppointmentInGivenDate || !lastAppointmentInGivenDate.length){
    if((new Date().getTime()) <= (new Date(shiftBegin).getTime())) {
      lastAvailableTime = new Date(shiftBegin).getTime();
    }
    else {
      lastAvailableTime = new Date(Date.now() + 5*60*1000).getTime(); // 5 minutes later
    }
    
  }
  else {
    if(lastAppointmentInGivenDate[0]._id.toString() === appointmentId.toString()) {      
      lastAvailableTime = lastAppointmentInGivenDate[0].estimatedLeaveTime.getTime();
      lastAvailableTime += 5 * 60 * 1000;  // 5 minutes later estimated leave 
    }
    else {
      lastAvailableTime = lastAppointmentInGivenDate[0].estimatedAvailableTime;
      lastAvailableTime = lastAvailableTime.getTime();
    }
  }
  
  const locationString = await getLatitudeLongitude([OFFICE_CODE, appointmentAdress]);
  
  const office = locationString[OFFICE_CODE].split(',').join('%2C');
  const appointmentPlace = locationString[appointmentAdress].split(',').join('%2C');
  
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

  const availableTimeAtOffice = ( leaveTimeFromOffice + 
    departure.duration + 
    appointmentDuration + 
    arrival.duration
  );
  
  const shiftEndingTime = new Date(shiftEnd).getTime();
  
  if((availableTimeAtOffice*1000) > shiftEndingTime) {
    throw new CustomError.BadRequestError('Date is not available for appointment. Please choose another date.');
  }

  return {
    date: appointmentDate,
    distance: departure.distance.text,
    estimatedLeaveTime: new Date(leaveTimeFromOffice*1000),
    estimatedAvailableTime: new Date(availableTimeAtOffice*1000)
  };
}

module.exports = {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  deleteAppointment
};