const express = require('express');
const { createHotel, getHotels, approveHotel, rejectHotel, getMyHotels, getHotel, getOwnerStats, updateHotel } = require('../controllers/hotelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('hotelOwner'), createHotel);

router.get('/mine', protect, authorize('hotelOwner'), getMyHotels);
router.get('/stats/mine', protect, authorize('hotelOwner'), getOwnerStats);

router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorize('hotelOwner', 'admin'), updateHotel);

router
    .route('/:id/approve')
    .put(protect, authorize('admin'), approveHotel);

router
    .route('/:id/reject')
    .put(protect, authorize('admin'), rejectHotel);

module.exports = router;
