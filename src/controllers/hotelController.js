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

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
  try {
    // Only return approved hotels to public
    const hotels = await Hotel.find({ isApproved: true });

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
