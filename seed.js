import mongoose from 'mongoose';
import { Room, Booking } from './models.js';


const seedData = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("🧹 Cleaning Database...");
  
  await Room.deleteMany({});
  await Booking.deleteMany({});

  console.log("🌱 Seeding Rooms...");
  const roomTypes = [
    { range: [101, 105], type: "Single", price: 2500, amenities: ["WiFi", "TV"] },
    { range: [201, 205], type: "Double", price: 4500, amenities: ["WiFi", "TV", "MiniBar"] },
    { range: [301, 303], type: "Suite", price: 8000, amenities: ["WiFi", "TV", "Jacuzzi", "Ocean View"] },
    { range: [401, 402], type: "Deluxe", price: 12000, amenities: ["WiFi", "TV", "Private Pool", "Butler"] }
  ];

  let rooms = [];
  roomTypes.forEach(group => {
    for (let i = group.range[0]; i <= group.range[1]; i++) {
      rooms.push({
        number: i.toString(),
        type: group.type,
        price: group.price,
        status: Math.random() > 0.7 ? (Math.random() > 0.5 ? "Occupied" : "Cleaning") : "Available",
        amenities: group.amenities
      });
    }
  });

  await Room.insertMany(rooms);

  console.log("👤 Seeding Guests...");
  // Create bookings for occupied rooms
  const occupiedRooms = await Room.find({ status: 'Occupied' });
  const guestNames = ["Amit Sharma", "Priya Patel", "Rahul Verma", "Sneha Gupta", "Vikram Singh", "Anjali Mehta"];
  
  for (let i = 0; i < occupiedRooms.length; i++) {
    await Booking.create({
      guestName: guestNames[i % guestNames.length],
      roomNumber: occupiedRooms[i].number,
      amount: occupiedRooms[i].price,
      status: 'Active',
      checkIn: new Date(Date.now() - Math.random() * 100000000) // Random time in past
    });
  }

  console.log(`✅ Database Seeded! ${rooms.length} Rooms & ${occupiedRooms.length} Active Guests created.`);
  mongoose.disconnect();
};

seedData();