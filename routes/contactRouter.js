const express = require('express');
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getSingleContact,
  updateContact
} = require('../controllers/contactController');

router.get('/', getAllContacts);
router.post('/', createContact)
router.get('/:id', getSingleContact);
router.put('/:id', updateContact);

module.exports = router;