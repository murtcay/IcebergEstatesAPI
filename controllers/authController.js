const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { createJWT } = require('../utils');

const register = async (req, res) => { 
  const { name, email, password } = req.body;
  
  if(!name || !email || !password) {
    throw new BadRequestError('Please provide name, email and password.');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user'

  const user = await User.create({ name, email, password, role });
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const token = createJWT({ payload: tokenUser });

  res.status(StatusCodes.CREATED).json({
    user: tokenUser,
    token
  });

}
const login = async (req, res) => { 
  const { email, password } = req.body;

  if(!email || !password) {
    throw new BadRequestError('Please provide email and pasword.');
  }

  const user = await User.findOne({ email });

  if(!user) {
    throw new UnauthenticatedError('Invalid Credentials.');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if(!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials.');
  }

  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const token = createJWT({ payload: tokenUser });

  res.status(StatusCodes.OK).json({
    user: tokenUser,
    token
  });
}
const logout = async (req, res) => { res.send('Logout Route'); }

module.exports = {
  login,
  register,
  logout
};