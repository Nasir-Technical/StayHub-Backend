const express = require('express');
const { createHotel, getHotels, approveHotel, rejectHotel } = require('../controllers/hotelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('hotelOwner'), createHotel);

router
    .route('/:id/approve')
    .put(protect, authorize('admin'), approveHotel);

router
    .route('/:id/reject')
    .put(protect, authorize('admin'), rejectHotel);

module.exports = router;
