const express = require('express');
const { createBooking } = require('../controllers/bookingController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);

module.exports = router;
