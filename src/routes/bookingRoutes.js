const express = require('express');
const { createBooking, getOwnerBookings } = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/owner', protect, authorize('hotelOwner'), getOwnerBookings);

module.exports = router;
