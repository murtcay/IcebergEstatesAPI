const express = require('express');
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getSingleContact,
  updateContact
} = require('../controllers/contactController');

const {
  authenticatUser,
  authorizePermissions
} = require('../middleware/authentication');

router.get('/', [authenticatUser, authorizePermissions('admin')], getAllContacts);
router.post('/', [authenticatUser, authorizePermissions('admin')], createContact)
router.get('/:id', [authenticatUser, authorizePermissions('admin')], getSingleContact);
router.put('/:id', [authenticatUser, authorizePermissions('admin')], updateContact);

module.exports = router;