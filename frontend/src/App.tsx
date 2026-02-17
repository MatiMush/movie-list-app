import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Movie {
    id: number;
    title: string;
    genre: string;
    year: number;
    description: string;
    poster: string;
}

const App: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Fetch movies from backend
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/movies');
                setMovies(response.data);
                setFilteredMovies(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch movies');
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Filter movies when genre or year changes
    useEffect(() => {
        let filtered = movies;

        if (selectedGenre !== 'all') {
            filtered = filtered.filter(movie => movie.genre === selectedGenre);
        }

        if (selectedYear !== 'all') {
            filtered = filtered.filter(movie => movie.year === parseInt(selectedYear));
        }

        setFilteredMovies(filtered);
    }, [selectedGenre, selectedYear, movies]);

    // Get unique genres from movies
    const genres = Array.from(new Set(movies.map(movie => movie.genre)));

    // Get unique years from movies
    const years = Array.from(new Set(movies.map(movie => movie.year))).sort((a, b) => b - a);

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎬 Movie List App</h1>
            </header>

            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="genre-filter">Filter by Genre:</label>
                    <select
                        id="genre-filter"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="all">Show All</option>
                        {genres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="year-filter">Filter by Year:</label>
                    <select
                        id="year-filter"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="all">Show All</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <div className="loading">Loading movies...</div>}
            {error && <div className="error">{error}</div>}

            <div className="movies-grid">
                {filteredMovies.map(movie => (
                    <div key={movie.id} className="movie-card">
                        <div className="movie-poster">
                            <img src={movie.poster} alt={movie.title} />
                        </div>
                        <div className="movie-info">
                            <h3 className="movie-title">{movie.title}</h3>
                            <div className="movie-meta">
                                <span className="movie-genre">{movie.genre}</span>
                                <span className="movie-year">{movie.year}</span>
                            </div>
                            <p className="movie-description">{movie.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMovies.length === 0 && !loading && !error && (
                <div className="no-results">No movies found with the selected filters.</div>
            )}
        </div>
    );
};

export default App;