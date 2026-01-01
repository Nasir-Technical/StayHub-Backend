const express = require('express');
const { createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('hotelOwner'), createRoom);

router
  .route('/:id')
  .put(protect, authorize('hotelOwner'), updateRoom)
  .delete(protect, authorize('hotelOwner'), deleteRoom);

module.exports = router;
