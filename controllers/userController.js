const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse, 
  createTokenUser,
  checkPermissions
} = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if(!user) {
    throw new CustomError.BadRequestError(`No user with id: ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if(!name || !email) {
    throw new CustomError.BadRequestError('Please provide all values.');
  }

  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;

  await user.save();
  
  const tokenUser= createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });

};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if(!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if(!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const passwordsEqual = await user.comparePassword(newPassword);

  if(passwordsEqual) {
    throw new CustomError.BadRequestError('New password cannot be same with old password.');
  }

  user.password = newPassword;
  user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.'});
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword
};
