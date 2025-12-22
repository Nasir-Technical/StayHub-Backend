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

// @desc    Block user (Toggle isActive)
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.blockUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
