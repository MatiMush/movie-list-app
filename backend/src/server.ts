import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import listRoutes from './routes/listRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/lists', listRoutes);
app.use('/api', movieRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Movie List API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 TMDB API integration enabled`);
  console.log(`🎬 Movies will be fetched from TMDB on first request`);
});