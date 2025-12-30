const Hotel = require('../models/Hotel');

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Owner)
exports.createHotel = async (req, res, next) => {
  try {
    // Add user to req,body
    req.body.owner = req.user.id;

    // Check for existing hotel (Optional rule: One hotel per owner? Spec doesn't say. Skipping restriction for now.)

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      data: hotel
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

// @desc    Get all hotels with search & filter
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, checkIn, checkOut, minRating } = req.query;

    console.log(req.query);

    const pipeline = [];

    // 1. Match Basic Hotel Fields (Approved, City, Rating)
    const matchStage = { isApproved: true };

    if (city) {
      matchStage.city = { $regex: city, $options: 'i' };
    }

    if (minRating) {
      matchStage.rating = { $gte: parseFloat(minRating) };
    }

    pipeline.push({ $match: matchStage });

    // 2. Lookup Rooms (Filter by Price and Availability)
    const roomLookupLet = { hotelId: '$_id' };
    const roomLookupPipeline = [
      { $match: { $expr: { $eq: ['$hotel', '$$hotelId'] } } }
    ];

    // Filter by Price
    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = parseFloat(minPrice);
      if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);
      roomLookupPipeline.push({ $match: { price: priceMatch } });
    }

    // Filter by Date Availability
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      // Lookup Bookings for this room that overlap
      roomLookupPipeline.push({
        $lookup: {
          from: 'bookings',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$room', '$$roomId'] },
                    // Overlap Condition: StartA < EndB && EndA > StartB
                    { $lt: ['$checkIn', end] },
                    { $gt: ['$checkOut', start] }
                  ]
                }
              }
            }
          ],
          as: 'overlappingBookings'
        }
      });

      // Exclude rooms with overlapping bookings OR no available rooms
      // Logic: If overlappingBookings.length > 0 => Unavailable
      // Also: availableRooms > 0 must be true (general capacity)
      roomLookupPipeline.push({
        $match: {
          overlappingBookings: { $size: 0 },
          availableRooms: { $gt: 0 }
        }
      });
      
      // Remove the temp field
      roomLookupPipeline.push({ $project: { overlappingBookings: 0 } });
    } else {
        // If no dates provided, just check if it has "some" inventory? 
        // Or just availableRooms > 0
        roomLookupPipeline.push({ $match: { availableRooms: { $gt: 0 } } });
    }

    pipeline.push({
      $lookup: {
        from: 'rooms',
        let: roomLookupLet,
        pipeline: roomLookupPipeline,
        as: 'rooms'
      }
    });

    // 3. Filter Hotels that have at least one valid room
    pipeline.push({
      $match: {
        'rooms.0': { $exists: true }
      }
    });

    // 4. Sort (by Rating Descending by default?)
    pipeline.push({ $sort: { rating: -1, createdAt: -1 } });

    console.log('Search Pipeline:', JSON.stringify(pipeline, null, 2));

    const hotels = await Hotel.aggregate(pipeline);
    console.log('Search Results Count:', hotels.length);

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Approve hotel
// @route   PUT /api/hotels/:id/approve
// @access  Private (Admin)
exports.approveHotel = async (req, res, next) => {
    try {
        let hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
             return res.status(404).json({ success: false, error: 'Hotel not found' });
        }

        hotel = await Hotel.findByIdAndUpdate(req.params.id, { isApproved: true }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: hotel
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}

// @desc    Reject hotel
// @route   PUT /api/hotels/:id/reject
// @access  Private (Admin)
exports.rejectHotel = async (req, res, next) => {
    try {
        let hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
             return res.status(404).json({ success: false, error: 'Hotel not found' });
        }

        hotel = await Hotel.findByIdAndUpdate(req.params.id, { isApproved: false }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: hotel
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get owner's hotels
// @route   GET /api/owner/hotels
// @access  Private (Hotel Owner)
exports.getMyHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find({ owner: req.user.id });
        res.status(200).json({
            success: true,
            count: hotels.length,
            data: hotels
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('owner', 'name email');

        if (!hotel) {
            return res.status(404).json({ success: false, error: 'Hotel not found' });
        }

        const rooms = await require('../models/Room').find({ hotel: req.params.id });

        res.status(200).json({
            success: true,
            data: { ...hotel.toObject(), rooms }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
