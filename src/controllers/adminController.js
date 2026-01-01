const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats (Revenue, Counts)
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    // 1. Total Revenue (Sum of commissions)
    const revenueAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$commission' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const totalBookings = revenueAgg.length > 0 ? revenueAgg[0].totalBookings : 0;

    // 2. Counts
    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        users: totalUsers,
        hotels: totalHotels,
        bookings: totalBookings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all hotels (Admin view)
// @route   GET /api/admin/hotels
// @access  Private (Admin)
exports.getAllHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find().populate('owner', 'name email');
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

// @desc    Block/Unblock user (Toggle isActive)
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.blockUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Toggle logic: If active(true) -> false. If blocked(false) -> true
        // Or specific status if body provided (optional)
        const newStatus = !user.isActive;

        user = await User.findByIdAndUpdate(req.params.id, { isActive: newStatus }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user,
            message: newStatus ? 'User unblocked' : 'User blocked'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
