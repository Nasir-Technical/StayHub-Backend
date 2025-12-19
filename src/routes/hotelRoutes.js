const express = require('express');
const { createHotel, getHotels, approveHotel } = require('../controllers/hotelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('hotelOwner'), createHotel);

router
    .route('/:id/approve')
    .put(protect, authorize('admin'), approveHotel);

module.exports = router;
