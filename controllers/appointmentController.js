const createAppointment = async (req, res) => { res.send('Create appointment');};
const getAllAppointments = async (req, res) => { res.send('Get all appointments');};
const getSingleAppointment = async (req, res) => { res.send('Get single appointment');};
const updateAppointment = async (req, res) => { res.send('Update appointment');};
const deleteAppointment = async (req, res) => { res.send('Delete appointment');};

module.exports = {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  deleteAppointment
};