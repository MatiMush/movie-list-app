import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moviesRoutes from './routes/moviesRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', moviesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Movie List App Backend - Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});