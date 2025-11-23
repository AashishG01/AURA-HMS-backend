import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkIn: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'CheckedOut', 'Cancelled'], default: 'Active' },
  amount: Number
});

export default mongoose.model('Booking', bookingSchema);