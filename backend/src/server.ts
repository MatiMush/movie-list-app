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

// Function to fetch and transform movies from TMDB
async function fetchMoviesFromTMDB(pages: number = 5): Promise<Movie[]> {
    try {
        const allMovies: Movie[] = [];
        
        // Fetch multiple pages to get ~100 movies
        for (let page = 1; page <= pages; page++) {
            const response = await axios.get(
                `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
            );
            
            const movies = response.data.results;
            
            // Process each movie with credits
            for (const movie of movies) {
                // Fetch credits for this movie
                const { director, actors } = await fetchMovieCredits(movie.id);
                
                // Extract year from release_date
                const year = movie.release_date 
                    ? parseInt(movie.release_date.split('-')[0]) 
                    : 0;
                
                // Get genre name from first genre_id
                const genreName = movie.genre_ids && movie.genre_ids.length > 0
                    ? genreMap[movie.genre_ids[0]] || 'Unknown'
                    : 'Unknown';
                
                // Build poster URL
                const poster = movie.poster_path 
                    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                    : 'https://via.placeholder.com/500x750?text=No+Poster';
                
                // Transform to our Movie interface
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
            
            // Add a small delay between pages to avoid rate limiting
            if (page < pages) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
        
        return allMovies;
    } catch (error) {
        console.error('Error fetching movies from TMDB:', error);
        throw error;
    }
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});