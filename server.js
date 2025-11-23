import express from 'express';
import cors from 'cors';
import connectDB from './config.js/db.js';
import apiRoutes from './routes/api.js';

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Config
connectDB();
app.use(cors());
app.use(express.json());

// 2. Routes
app.use('/api', apiRoutes);

// 3. Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});