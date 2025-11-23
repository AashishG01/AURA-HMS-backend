# 🏨 Aura PMS - AI Powered Hotel Management System

A modern, voice-enabled Hotel Property Management System (PMS) built with the MERN Stack and Google Gemini AI. This application features a clean, professional UI, real-time analytics, and an intelligent voice assistant capable of handling bookings, cancellations, and inventory management via natural language.

Frontend - https://github.com/AashishG01/AURA-HMS-frontend

Backend - https://github.com/AashishG01/AURA-HMS-backend

## 🧠 Technical Architecture & Core AI Logic

This project implements a sophisticated AI pipeline that processes voice commands into database actions. Here is a detailed breakdown of the 5 key pillars:

### 1. Speech-to-Text Conversion (STT)
Instead of expensive cloud APIs, we utilize the browser's native capabilities for low-latency and zero-cost transcription.

**Implementation**: Web Speech API (`window.webkitSpeechRecognition`) in the React Frontend.

**Workflow**:
- User clicks the "Voice Command" button in ChatInterface.jsx
- Browser listens to microphone stream in real-time
- Converts audio to text string (e.g., "Book room 101 for Rahul")
- Text is sent to Backend API for processing

### 2. Natural Language Understanding (NLU)
We use Generative AI (LLM) as our NLU engine, bypassing the need for rigid intent training.

**Engine**: Google Gemini 2.5 Flash (via `generativelanguage.googleapis.com`)

**Context Injection**: Backend fetches live database data (prices, availability, room status) before sending query to AI

**Logic**: AI receives system prompt with live data and analyzes user text to:
- Identify Intent (BOOK_ROOM, CANCEL_BOOKING, QUERY)
- Extract Entities (Room Number, Guest Name, Dates)
- Validate room availability and existence

### 3. Response Generation
AI generates structured JSON response for both logic execution and user interaction.

**Dynamic Prompting**: System prompt instructs Gemini to act as "Warm, Professional Hotel Manager"

**Output Format**:
```json
{
  "intent": "BOOK_ROOM",
  "roomNumber": "101",
  "spoken_response": "I have successfully booked Room 101 for Mr. Rahul.",
  "display_text": "Booking Confirmed: Room 101"
}
```

### 4. Text-to-Speech Conversion (TTS)
Completes the voice loop by vocalizing AI responses.

**Implementation**: Web Speech API (`window.speechSynthesis`) in App.jsx

**Voice Selection**: Automatically selects high-quality English voice available on user's device

### 5. Backend & Database Integration
The "Action Layer" where AI interacts with the real world.

**Stack**: Node.js + Express + MongoDB (Mongoose ODM)

**Execution Flow**:
- `aiController.js` receives JSON from Gemini
- Switches logic based on intent:
  - `BOOK_ROOM`: Creates booking, updates room status to "Occupied"
  - `CANCEL_BOOKING`: Cancels booking, frees up room
  - `ADD_ROOM`: Performs admin room creation
- Real-time frontend updates via polling

## ✨ Key Features

### 🤖 AI Voice Concierge
**Full CRUD Capability**:
- 📅 **Book Rooms**: "Book the Deluxe Suite for Mr. Sharma."
- ❌ **Cancel Bookings**: "Cancel booking for Room 101."
- 🧹 **Housekeeping**: "Mark Room 205 as Cleaning."
- ➕ **Admin Tasks**: "Add a new Single Room 505 price 3000."

### 📊 Interactive Dashboard
- **Real-time Analytics**: Live updates on Revenue, Occupancy, Availability
- **Visual Charts**: Revenue trends (Bar Chart) and Occupancy distribution (Pie Chart) using Recharts
- **KPI Metrics**: Trend indicators and performance insights

### 🏨 Front Desk Operations
- **Visual Room Grid**: Color-coded status for all rooms (Available, Occupied, Cleaning)
- **Guest Management**: Searchable table view of all active guests
- **Room Details**: Amenity icons and quick action buttons

### 👥 Guest Services
- **Comprehensive Guest List**: Detailed booking information
- **Search & Filter**: Quick guest lookup functionality
- **Status Management**: Active and completed booking tracking

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Running locally on port 27017 or MongoDB Atlas)
- **Gemini API Key** (Free from [Google AI Studio](https://aistudio.google.com/))

### 2. Clone & Setup Project
```bash
# Create project directory
mkdir aura-hotel-pms
cd aura-hotel-pms

# Clone repository (if using git)
git clone <your-repo-url> .
```

### 3. Backend Setup (Server)
```bash
cd server

# Install dependencies
npm install express cors mongoose dotenv

# Environment setup
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "MONGODB_URI=mongodb://localhost:27017/aura-pms" >> .env
echo "PORT=3000" >> .env

# Start the server
node server.js
```

### 4. Frontend Setup (Client)
```bash
# Open new terminal
cd client

# Install dependencies
npm install
npm install lucide-react recharts

# Start development server
npm run dev
```

### 5. Database Seeding (Optional)
```bash
# Populate with sample data
cd server
node seed.js
```

## 📂 Project Structure

```
aura-hotel-pms/
├── server/                 # Backend (The Brain)
│   ├── config/
│   │   └── db.js          # MongoDB Connection
│   ├── controllers/        # Logic Layer
│   │   ├── aiController.js # Handles NLU & Gemini Integration
│   │   └── analytics.js    # Fetches Dashboard Stats
│   ├── models/             # Database Schemas
│   │   ├── Room.js        # Room data model
│   │   ├── Booking.js     # Booking data model
│   │   └── Guest.js       # Guest data model
│   ├── routes/            # API Endpoints
│   │   ├── aiRoutes.js    # AI chat endpoints
│   │   └── statsRoutes.js # Analytics endpoints
│   ├── seed.js            # Sample data generator
│   └── server.js          # Express server entry point
│
└── src/                   # Frontend (The Face)
    ├── components/        # Modular UI Components
    │   ├── Sidebar.jsx    # Navigation sidebar
    │   ├── DashboardTab.jsx # Charts & KPIs
    │   ├── RoomsTab.jsx   # Live Room Status Grid
    │   ├── GuestsTab.jsx  # Guest Data Table
    │   └── ChatInterface.jsx # Voice UI & Mic Controls
    ├── App.jsx            # Main Layout & State Management
    └── main.jsx           # React Entry Point
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/aura-pms
PORT=3000
```

**Frontend**:
Update `BACKEND_URL` in `App.jsx` if needed:
```javascript
const BACKEND_URL = "http://localhost:3000";
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Fetch dashboard analytics |
| POST | `/api/chat` | Process AI voice commands |
| GET | `/api/rooms` | Get all rooms data |
| GET | `/api/bookings` | Get current bookings |

## 🎯 Usage Guide

### Voice Commands Examples

**Booking Management**:
- "Book room 101 for John Doe for 2 nights"
- "Cancel the booking in room 205"
- "Extend stay for room 304 by one day"

**Room Operations**:
- "Mark room 102 as available"
- "Set room 201 to cleaning status"
- "Show me all available deluxe rooms"

**Guest Services**:
- "Find booking for Sarah Johnson"
- "What's the checkout time for room 105?"
- "How many guests are checking in today?"

### Manual Operations
- Use the room grid to manually update room status
- Access guest list for detailed booking information
- Utilize search functionality to find specific guests or rooms

## 🐛 Troubleshooting

### Common Issues

**Voice Recognition Not Working**:
- Ensure you're using Chrome/Edge browser
- Check microphone permissions
- Brave/Firefox may block Web Speech API by default

**Database Not Updating**:
- Check MongoDB connection in terminal logs
- Verify Gemini API key is valid
- Check server logs for JSON parsing errors

**AI Responses Not Accurate**:
- Ensure proper context injection in system prompts
- Verify room availability in real-time data
- Check for valid intent mapping

**Frontend Not Connecting**:
- Verify backend server is running on port 3000
- Check CORS configuration
- Ensure all environment variables are set

### Debugging Steps

1. **Check Server Logs**:
   ```bash
   cd server
   node server.js
   ```

2. **Verify Database Connection**:
   ```bash
   mongosh
   use aura-pms
   db.rooms.find()
   ```

3. **Test API Endpoints**:
   ```bash
   curl http://localhost:3000/api/stats
   ```

## 🛠️ Development

### Adding New Features

**New Voice Command**:
1. Update `aiController.js` intent handling
2. Add corresponding database operations
3. Update frontend state management if needed

**New Dashboard Widget**:
1. Create new component in `src/components/`
2. Add to `DashboardTab.jsx`
3. Create backend API endpoint if needed

### Customization

**Theming**:
- Modify color scheme in component files
- Update `COLORS` constant for chart colors
- Adjust spacing and typography in CSS classes

**AI Behavior**:
- Modify system prompt in `aiController.js`
- Adjust response formatting
- Add new entity extraction patterns

## 📊 Performance Notes

- **Real-time Updates**: Frontend polls backend every 3 seconds
- **Voice Processing**: Average response time 2-3 seconds
- **Database**: Optimized queries with proper indexing
- **Frontend**: Efficient re-rendering with React best practices

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for natural language processing
- **Lucide React** for beautiful icons
- **Recharts** for data visualization
- **MongoDB** for flexible data storage

---

**Note**: Replace placeholder images and URLs with actual project screenshots and documentation links before deployment.

For support or questions, please open an issue in the project repository.