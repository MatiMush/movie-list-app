import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('🔑 TMDB API Key loaded:', TMDB_API_KEY ? 'YES ✅' : 'NO ❌');

// Get popular movies
router.get('/popular', async (req, res) => {
    try {
        console.log('🎬 Fetching popular movies...');
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                page
            }
        });
        console.log('✅ Popular movies fetched successfully');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error fetching popular movies:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error fetching popular movies', error: error.message });
    }
});

// Get top rated movies
router.get('/top-rated', async (req, res) => {
    try {
        console.log('⭐ Fetching top rated movies...');
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
            params: {
                api_key: TMDB_API_KEY,
                page
            }
        });
        console.log('✅ Top rated movies fetched successfully');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error fetching top rated movies:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error fetching top rated movies', error: error.message });
    }
});

// Get now playing movies
router.get('/now-playing', async (req, res) => {
    try {
        console.log('🎥 Fetching now playing movies...');
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: {
                api_key: TMDB_API_KEY,
                page
            }
        });
        console.log('✅ Now playing movies fetched successfully');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error fetching now playing movies:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error fetching now playing movies', error: error.message });
    }
});

// Search movies
router.get('/search', async (req, res) => {
    try {
        console.log('🔍 Searching movies...');
        const { query, page = 1 } = req.query;
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                page
            }
        });
        console.log('✅ Movies search completed');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error searching movies:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error searching movies', error: error.message });
    }
});

// Discover movies with filters
router.get('/discover', async (req, res) => {
    try {
        console.log('🧭 Discovering movies with filters...');
        const { genre, year, page = 1 } = req.query;

        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                with_genres: genre || undefined,
                primary_release_year: year || undefined,
                page
            }
        });

        console.log('✅ Discover movies fetched successfully');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error discovering movies:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error discovering movies', error: error.message });
    }
});

// Get genres
router.get('/genres', async (req, res) => {
    try {
        console.log('🎭 Fetching genres...');
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        console.log('✅ Genres fetched successfully');
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Error fetching genres:', error.message);
        console.error('Response:', error.response?.data);
        res.status(500).json({ message: 'Error fetching genres', error: error.message });
    }
});

export default router;