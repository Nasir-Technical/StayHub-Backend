const mongoose = require('mongoose');
require('dotenv').config(); // Looks for .env in current dir
const Hotel = require('./src/models/Hotel');
const Room = require('./src/models/Room');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        const hotels = await Hotel.find({});
        console.log('\n--- HOTELS ---');
        hotels.forEach(h => {
            console.log(`ID: ${h._id}, Name: ${h.name}, City: "${h.city}", Approved: ${h.isApproved}, Rating: ${h.rating}`);
        });

        const rooms = await Room.find({});
        console.log('\n--- ROOMS ---');
        rooms.forEach(r => {
            console.log(`ID: ${r._id}, Name: ${r.name}, Hotel: ${r.hotel}, Price: ${r.price}, Available: ${r.availableRooms}, Total: ${r.totalRooms}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
