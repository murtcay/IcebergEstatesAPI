const Contact = require('../models/Contact');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createContact = async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  
  if(!first_name || !last_name || !email || !phone ) {
    throw new CustomError.BadRequestError('Please provide all values.');
  }

  const contact = await Contact.create({ first_name, last_name, email, phone });
  res.status(StatusCodes.CREATED).json({ contact });
};

const getAllContacts = async (req, res) => {
  const contacts = await Contact.find({});
  res.status(StatusCodes.OK).json({ contacts });
};

const getSingleContact = async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id });

  if(!contact) {
    throw new CustomError.BadRequestError(`No contact with id: ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({ contact });
};

const updateContact = async (req, res) => {
  
  const { first_name, last_name, email, phone } = req.body;

  if(!first_name || !last_name || !email || !phone ) {
    throw new CustomError.BadRequestError('Please provide all values.');
  }

  const contact = await Contact.findOne({ _id: req.params.id });

  contact.first_name = first_name;
  contact.last_name = last_name;
  contact.email = email;
  contact.phone = phone;

  await contact.save();
  res.status(StatusCodes.OK).json({ contact });
};

module.exports = {
  createContact,
  getAllContacts,
  getSingleContact,
  updateContact
};
