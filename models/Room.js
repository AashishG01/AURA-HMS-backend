import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'], default: 'Available' },
  amenities: [String]
});

export default mongoose.model('Room', roomSchema);