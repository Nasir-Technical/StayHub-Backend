const express = require('express');
const { createHotel, getHotels, approveHotel, rejectHotel, getMyHotels, getHotel } = require('../controllers/hotelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('hotelOwner'), createHotel);

router.get('/mine', protect, authorize('hotelOwner'), getMyHotels);

router.get('/:id', getHotel);

router
    .route('/:id/approve')
    .put(protect, authorize('admin'), approveHotel);

router
    .route('/:id/reject')
    .put(protect, authorize('admin'), rejectHotel);

module.exports = router;
