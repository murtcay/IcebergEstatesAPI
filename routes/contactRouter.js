const express = require('express');
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getSingleContact,
  updateContact
} = require('../controllers/contactController');

const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');

router.get('/', [authenticateUser, authorizePermissions('admin')], getAllContacts);
router.post('/', [authenticateUser, authorizePermissions('admin')], createContact)
router.get('/:id', [authenticateUser, authorizePermissions('admin')], getSingleContact);
router.put('/:id', [authenticateUser, authorizePermissions('admin')], updateContact);

module.exports = router;