const CustomError = require('../errors');
const { isTokenValid } = require('../utils'); 

const authenticatUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  
  if(!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

module.exports = {
  authenticatUser
};