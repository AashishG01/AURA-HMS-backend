import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

export const getHotelStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const activeBookings = await Booking.find({ status: 'Active' });
    const revenue = activeBookings.reduce((acc, curr) => acc + curr.amount, 0);
    
    const rooms = await Room.find();

    res.json({
      stats: { totalRooms, availableRooms, occupiedRooms, revenue },
      rooms: rooms,
      recentBookings: activeBookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};