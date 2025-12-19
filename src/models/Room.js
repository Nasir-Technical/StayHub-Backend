const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [1, 'Price must be greater than 0']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Please add total rooms'],
    min: [1, 'Total rooms must be at least 1']
  },
  availableRooms: {
    type: Number
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to set availableRooms = totalRooms if not set (mostly for initial creation if not handled in controller)
roomSchema.pre('save', function(next) {
  if (this.isNew && this.availableRooms === undefined) {
    this.availableRooms = this.totalRooms;
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
