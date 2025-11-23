import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'], default: 'Available' },
  amenities: [String]
});

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkIn: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'CheckedOut', 'Cancelled'], default: 'Active' },
  amount: Number
});

export const Room = mongoose.model('Room', roomSchema);
export const Booking = mongoose.model('Booking', bookingSchema);