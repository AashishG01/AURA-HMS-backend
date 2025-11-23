import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

const API_KEY = process.env.GEMINI_API_KEY; 

export const handleAIChat = async (req, res) => {
  const { query, history } = req.body;
  
  // --- STEP 1: DATABASE SE REAL DATA NIKALO (Merged Logic) ---
  const rooms = await Room.find();
  
  // 1. Basic Stats (For Summary)
  const totalRooms = rooms.length;
  const availableRoomsList = rooms.filter(r => r.status === 'Available').map(r => r.number);

  // 2. Detailed Inventory (For AI Context - Prices & Amenities)
  const roomTypes = ['Single', 'Double', 'Suite', 'Deluxe'];
  let inventoryDetails = [];

  roomTypes.forEach(type => {
    const specificRooms = rooms.filter(r => r.type === type);
    if (specificRooms.length > 0) {
      const sample = specificRooms[0]; // Ek room se price/amenities utha lo
      const availableCount = specificRooms.filter(r => r.status === 'Available').length;
      const totalCount = specificRooms.length;
      
      // Yeh detailed string AI padhega facts ke liye
      inventoryDetails.push(
        `➜ Room Type: ${type.toUpperCase()}\n   - Price: ₹${sample.price} per night\n   - Amenities: ${sample.amenities.join(', ')}\n   - Status: ${availableCount} rooms available out of ${totalCount}`
      );
    }
  });

  const liveInventoryContext = inventoryDetails.join('\n\n');
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    // --- STEP 2: MERGED SYSTEM PROMPT (Personality + Data Rules) ---
    const systemPrompt = `
      You are AURA, the warm, professional, and highly intelligent General Manager of Hotel Aura.
      
      **🌟 CORE PERSONALITY (Human-like):**
      1. **TONE:** Be polite, elegant, and helpful. Imagine you are standing at the front desk speaking to a VIP guest.
      2. **NO ROBOTIC SPEAK:** NEVER use phrases like "Processing command", "System updated", "Functioning optimally", or "Database modified".
      3. **CONCISENESS:** Keep spoken responses short (1-2 sentences max) because they will be spoken out loud.
      4. **EMPATHY:** If a user wants to cancel or is angry, be apologetic. If they are booking, be welcoming.

      **🛑 STRICT DATA RULES (Logic):**
      1. **DO NOT HALLUCINATE:** Use ONLY the "LIVE HOTEL INVENTORY" provided below for prices, amenities, and availability.
      2. **CURRENCY:** Always use **Rupees (₹)**. Never use Dollars.
      3. **AVAILABILITY:** If the user asks "What is available?", tell them exactly how many rooms are free based on the data below.

      **🏨 LIVE HOTEL INVENTORY (REAL-TIME DB CONTEXT):**
      ${liveInventoryContext}
      
      **YOUR CAPABILITIES (CRUD Operations):**
      1. **BOOK_ROOM**: e.g., "Book room 101 for Rahul".
      2. **CANCEL_BOOKING**: e.g., "Cancel booking for room 101".
      3. **UPDATE_STATUS**: e.g., "Mark 101 as Cleaning".
      4. **ADD_ROOM**: e.g., "Add a new Single room 501 price 2000".
      5. **DELETE_ROOM**: e.g., "Remove room 501".
      6. **QUERY**: e.g., "Which rooms are free?", "How much revenue?".

      **INSTRUCTIONS:**
      - For 'ADD_ROOM', extract: roomNumber, type (Single/Double/Suite), price.
      - Always return JSON.
      
      **REQUIRED JSON OUTPUT:**
      {
         "intent": "QUERY" | "BOOK_ROOM" | "CANCEL_BOOKING" | "UPDATE_STATUS" | "ADD_ROOM" | "DELETE_ROOM",
         "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
         "roomNumber": "101" (or null),
         "guestName": "Name" (or null),
         "newStatus": "Available" | "Occupied" | "Cleaning" | "Maintenance" (or null),
         "roomDetails": { "type": "Single", "price": 100 } (Only for ADD_ROOM),
         "spoken_response": "A natural, human-like response to speak (using real prices/amenities).",
         "display_text": "Short text for the screen."
      }
    `;

    const payload = {
      contents: [{ role: "user", parts: [{ text: `History: ${JSON.stringify(history)}\nUser Query: ${query}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" }
    };

    const apiRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const aiData = await apiRes.json();
    let result = JSON.parse(aiData.candidates?.[0]?.content?.parts?.[0]?.text);

    // --- EXECUTE DB ACTIONS (Full CRUD) ---
    
    // 1. BOOKING (Create)
    if (result.intent === "BOOK_ROOM" && result.roomNumber && result.guestName) {
      const room = await Room.findOne({ number: result.roomNumber });
      if (room && room.status === 'Available') {
        room.status = 'Occupied'; await room.save();
        await Booking.create({ guestName: result.guestName, roomNumber: result.roomNumber, amount: room.price });
        // Success message handled by AI's spoken_response based on prompt
      } else {
        result.spoken_response = `I'm terribly sorry, but Room ${result.roomNumber} isn't available for booking at the moment.`;
      }
    }

    // 2. CANCEL BOOKING (Delete/Update)
    else if (result.intent === "CANCEL_BOOKING" && result.roomNumber) {
      const booking = await Booking.findOne({ roomNumber: result.roomNumber, status: 'Active' });
      if (booking) {
        booking.status = 'Cancelled'; await booking.save();
        await Room.findOneAndUpdate({ number: result.roomNumber }, { status: 'Available' });
      } else {
        result.spoken_response = `I checked our records, but I couldn't find an active booking for Room ${result.roomNumber}.`;
      }
    }

    // 3. UPDATE STATUS (Update)
    else if (result.intent === "UPDATE_STATUS" && result.roomNumber && result.newStatus) {
       await Room.findOneAndUpdate({ number: result.roomNumber }, { status: result.newStatus });
    }

    // 4. ADD ROOM (Create Room - Admin)
    else if (result.intent === "ADD_ROOM" && result.roomNumber && result.roomDetails) {
      try {
        await Room.create({
          number: result.roomNumber,
          type: result.roomDetails.type || 'Single',
          price: result.roomDetails.price || 2500,
          status: 'Available'
        });
      } catch (e) {
        result.spoken_response = `It appears Room ${result.roomNumber} already exists in our system.`;
      }
    }

    // 5. DELETE ROOM (Delete Room - Admin)
    else if (result.intent === "DELETE_ROOM" && result.roomNumber) {
      const deleted = await Room.findOneAndDelete({ number: result.roomNumber });
      if (!deleted) {
         result.spoken_response = `I couldn't locate Room ${result.roomNumber} in the database to delete.`;
      }
    }

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      spoken_response: "I apologize, I'm having a brief technical moment. Could you please repeat that?", 
      display_text: "System Error", 
      intent: "ERROR", 
      sentiment: "NEGATIVE" 
    });
  }
};