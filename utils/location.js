const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const getDistanceAndTime = async ({origin, destination, departureTime}) => {
  const {data: maps} = await axios({
    method: 'get',
    url: `${process.env.GOOGLE_MAPS_DISTANCE_MATRIX_API_HOST}json?origins=${origin}&destinations=${destination}&departure_time=${departureTime}&key=${process.env.GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY}`
  });

  let normal_duration = maps.rows[0].elements[0].duration.value;
  let traffic_duration = maps.rows[0].elements[0].duration_in_traffic.value;

  if(maps.rows[0].elements[0].status !== 'OK') {
    throw new CustomError.BadRequestError('Something went wrog with distance and time calculation.');
  }
  return {
    distance: maps.rows[0].elements[0].distance,
    duration: ((normal_duration > traffic_duration) ? normal_duration : traffic_duration )
  }
};

const getLocationInformations = async (addressArr) => {
  if(! addressArr.length) {
    throw CustomError.BadRequestError('Please provide addresses.');
  }
  
  const { data: locations} = await axios({
    method: 'post',
    url: `${process.env.POSTCODE_API_HOST}/postcodes`,
    data: {
      postcodes: addressArr
    }
  });

  const result = {};

  locations.result.forEach((item) => {
    const query = item.query.replace(' ','').toLowerCase();
    if(!result[query]) {
      result[query] = null;
    }
    result[query] = item.result;
  });

  return {
    status: locations.status,
    result
  };
};

const getLatitudeLongitude = async (addressArr) => {
  const locations = await getLocationInformations(addressArr);
  const result = {};

  for (const key in locations.result) {
    if (Object.hasOwnProperty.call(locations.result, key)) {
      result[`${key}`] = `${locations.result[key].latitude},${locations.result[key].longitude}`;
    }
  }

  return result;
};

const postcodeValidate = async (postcode) => {
  const {data: isValid} = await axios({
    method: 'get',
    url: `${process.env.POSTCODE_API_HOST}/postcodes/${postcode}/validate`
  })

  if(!isValid.result) {
    throw new CustomError.BadRequestError(`Postcode: ${postcode} is not validx.`);
  }
};

module.exports = {
  getDistanceAndTime,
  getLatitudeLongitude,
  getLocationInformations,
  postcodeValidate
};