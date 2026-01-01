const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const { room: roomId, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    // 1. Basic Validation
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, error: 'Please provide room, checkIn and checkOut dates' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ success: false, error: 'Check-out date must be after check-in date' });
    }

    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Check if hotel is approved
    const hotel = await Hotel.findById(room.hotel);

    if (!hotel || !hotel.isApproved) {
      return res.status(403).json({
        success: false,
        error: 'Hotel is not approved for booking'
      });
    }

    // 2. Room Availability Check (Capacity)
    if (room.availableRooms < 1) {
       return res.status(400).json({ success: false, error: 'Room is fully booked' });
    }

    // 3. Availability Check (Date Overlap)
    // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
    // Existing: start: checkIn, end: checkOut
    // New: start: start, end: end
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (overlappingBooking) {
      return res.status(400).json({ success: false, error: 'Room is already booked for these dates' });
    }

    // 4. Price Calculation
    const timeDiff = Math.abs(end - start);
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
    const totalPrice = days * room.price;

    // 5. Commission Calculation (10%)
    const commission = totalPrice * 0.10;

    // 6. Booking Save
    const booking = await Booking.create({
      user: userId,
      room: roomId,
      hotel: room.hotel,
      checkIn: start,
      checkOut: end,
      totalPrice,
      commission
    });

    // 7. Decrease room availableRooms by 1
    // Spec says "Update room availability after booking" (Decrease by 1)
    room.availableRooms -= 1;
    await room.save();

    res.status(201).json({
      success: true,
      data: booking
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

// @desc    Get bookings for hotel owner's properties
// @route   GET /api/bookings/owner
// @access  Private (Hotel Owner)
exports.getOwnerBookings = async (req, res, next) => {
    try {
        // 1. Find all hotels owned by this user
        const hotels = await Hotel.find({ owner: req.user.id });
        const hotelIds = hotels.map(h => h._id);

        // 2. Find bookings for these hotels
        const bookings = await Booking.find({ hotel: { $in: hotelIds } })
            .populate('user', 'name email')
            .populate('room', 'name')
            .populate('hotel', 'name')
            .sort('-createdAt'); // Latest first

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
