const express = require('express');
const { getStats, getUsers, blockUser } = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);

module.exports = router;
