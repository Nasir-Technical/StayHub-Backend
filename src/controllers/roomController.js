const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Hotel Owner)
exports.createRoom = async (req, res, next) => {
  try {
    const { hotel: hotelId, name, description, price, totalRooms } = req.body;

    // Validate hotelId presence
    if (!hotelId) {
       return res.status(400).json({ success: false, error: 'Please provide a valid hotel ID' });
    }

    // Find the hotel
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Check ownership
    // req.user.id is string, hotel.owner is ObjectId.
    if (hotel.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: `User ${req.user.id} is not authorized to add a room to this hotel`
      });
    }

    // Check if hotel is approved
    if (!hotel.isApproved) {
      return res.status(403).json({
         success: false,
         error: 'Hotel is not approved yet. Cannot add rooms.'
      });
    }

    // Create room
    // availableRooms defaults to totalRooms per spec
    const room = await Room.create({
      hotel: hotelId,
      name,
      description,
      price,
      totalRooms,
      availableRooms: totalRooms
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
