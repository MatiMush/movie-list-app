import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Validate API key on startup
if (!TMDB_API_KEY) {
    console.error('❌ ERROR: TMDB_API_KEY is not set in environment variables');
    console.error('Please create a .env file with TMDB_API_KEY=your_api_key_here');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// TMDB Genre mapping
const genreMap: { [key: number]: string } = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

// Movie interface
interface Movie {
    id: number;
    title: string;
    year: number;
    genre: string;
    rating: number;
    poster: string;
    director: string;
    actors: string[];
    description: string;
}

// Cache for movie data
let movieCache: Movie[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Helper function to fetch movie credits (director and actors)
async function fetchMovieCredits(movieId: number): Promise<{ director: string; actors: string[] }> {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
        );
        
        const { cast, crew } = response.data;
        
        // Get director
        const directorObj = crew.find((member: any) => member.job === 'Director');
        const director = directorObj ? directorObj.name : 'Unknown';
        
        // Get top 5 actors
        const actors = cast.slice(0, 5).map((actor: any) => actor.name);
        
        return { director, actors };
    } catch (error) {
        console.error(`Error fetching credits for movie ${movieId}:`, error);
        return { director: 'Unknown', actors: [] };
    }
}

// Function to fetch and transform movies from TMDB endpoint
async function fetchMoviesFromEndpoint(endpoint: string, pages: number = 1): Promise<Movie[]> {
    try {
        const allMovies: Movie[] = [];
        
        for (let page = 1; page <= pages; page++) {
            const separator = endpoint.includes('?') ? '&' : '?';
            const response = await axios.get(
                `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&page=${page}`
            );
            
            const movies = response.data.results;
            
            // Fetch credits for all movies in parallel
            const creditPromises = movies.map((movie: any) => 
                fetchMovieCredits(movie.id)
            );
            const creditsResults = await Promise.all(creditPromises);
            
            // Process each movie with its credits
            for (let i = 0; i < movies.length; i++) {
                const movie = movies[i];
                const { director, actors } = creditsResults[i];
                
                const year = movie.release_date 
                    ? parseInt(movie.release_date.split('-')[0]) 
                    : new Date().getFullYear();
                
                const genreName = movie.genre_ids && movie.genre_ids.length > 0
                    ? genreMap[movie.genre_ids[0]] || 'Unknown'
                    : 'Unknown';
                
                const poster = movie.poster_path 
                    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                    : 'https://via.placeholder.com/500x750?text=No+Poster';
                
                const transformedMovie: Movie = {
                    id: movie.id,
                    title: movie.title,
                    year: year,
                    genre: genreName,
                    rating: movie.vote_average,
                    poster: poster,
                    director: director,
                    actors: actors,
                    description: movie.overview || 'No description available'
                };
                
                allMovies.push(transformedMovie);
            }
            
            // Add a delay between pages to respect rate limits
            if (page < pages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return allMovies;
    } catch (error) {
        console.error('Error fetching movies from TMDB:', error);
        throw error;
    }
}

// Function to fetch and transform movies from TMDB (backward compatibility)
async function fetchMoviesFromTMDB(pages: number = 5): Promise<Movie[]> {
    return fetchMoviesFromEndpoint('/movie/popular', pages);
}

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/movies', async (req: Request, res: Response) => {
    try {
        // Check if cache is valid
        const now = Date.now();
        if (movieCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
            console.log('Returning cached movies');
            res.json(movieCache);
            return;
        }
        
        // Fetch fresh data from TMDB
        console.log('Fetching movies from TMDB...');
        const movies = await fetchMoviesFromTMDB(5); // Fetch 5 pages (~100 movies)
        
        // Update cache
        movieCache = movies;
        cacheTimestamp = now;
        
        console.log(`Fetched ${movies.length} movies from TMDB`);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// Search movies endpoint
app.get('/api/movies/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        const page = parseInt(req.query.page as string) || 1;
        
        // Handle empty search
        if (!query || query.trim() === '') {
            res.json([]);
            return;
        }
        
        console.log(`Searching movies with query: "${query}", page: ${page}`);
        const movies = await fetchMoviesFromEndpoint(`/search/movie?query=${encodeURIComponent(query)}`, page);
        
        console.log(`Found ${movies.length} movies for query "${query}"`);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies/search endpoint:', error);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

// Popular movies endpoint
app.get('/api/movies/popular', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        console.log(`Fetching popular movies, page: ${page}`);
        const movies = await fetchMoviesFromEndpoint('/movie/popular', page);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies/popular endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
});

// Top rated movies endpoint
app.get('/api/movies/top-rated', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        console.log(`Fetching top rated movies, page: ${page}`);
        const movies = await fetchMoviesFromEndpoint('/movie/top_rated', page);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies/top-rated endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch top rated movies' });
    }
});

// Now playing movies endpoint
app.get('/api/movies/now-playing', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        console.log(`Fetching now playing movies, page: ${page}`);
        const movies = await fetchMoviesFromEndpoint('/movie/now_playing', page);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies/now-playing endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch now playing movies' });
    }
});

// Movies by genre endpoint
app.get('/api/movies/genre/:genreId', async (req: Request, res: Response) => {
    try {
        const genreId = req.params.genreId;
        const page = parseInt(req.query.page as string) || 1;
        console.log(`Fetching movies for genre ${genreId}, page: ${page}`);
        const movies = await fetchMoviesFromEndpoint(`/discover/movie?with_genres=${genreId}`, page);
        res.json(movies);
    } catch (error) {
        console.error('Error in /api/movies/genre endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch movies by genre' });
    }
});

// Genres list endpoint
app.get('/api/genres', async (req: Request, res: Response) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
        );
        res.json(response.data.genres);
    } catch (error) {
        console.error('Error in /api/genres endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 TMDB API integration enabled`);
    console.log(`🎬 Movies will be fetched from TMDB on first request`);
});