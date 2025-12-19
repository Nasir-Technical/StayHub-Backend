const express = require('express');
const { createRoom } = require('../controllers/roomController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('hotelOwner'), createRoom);

module.exports = router;
