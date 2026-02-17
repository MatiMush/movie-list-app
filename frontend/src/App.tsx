import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './App.css';
import { MovieContext } from './context/MovieContext';
import { getYearsFromMovies } from './utils/filters';

interface Movie {
    id: number;
    title: string;
    genre: string;
    year: number;
    description: string;
    poster: string;
    director: string;
    actors: string[];
}

interface Genre {
    id: number;
    name: string;
}

type CategoryType = 'popular' | 'top-rated' | 'now-playing' | 'genre';

const API_BASE_URL = 'http://localhost:5000/api';

const App: React.FC = () => {
    const movieContext = useContext(MovieContext);
    
    if (!movieContext) {
        throw new Error('App must be used within MovieProvider');
    }
    
    const { genres: availableGenres, loadingGenres } = movieContext;
    
    const [movies, setMovies] = useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [selectedGenre, setSelectedGenre] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    // New state for categories
    const [activeCategory, setActiveCategory] = useState<CategoryType>('popular');
    const [selectedCategoryGenre, setSelectedCategoryGenre] = useState<number | null>(null);
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Fetch movies based on category or search
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError('');
                let response;

                if (isSearchMode && searchQuery.trim() !== '') {
                    // Search mode
                    response = await axios.get(`${API_BASE_URL}/movies/search`, {
                        params: { query: searchQuery, page: currentPage }
                    });
                } else if (activeCategory === 'popular') {
                    response = await axios.get(`${API_BASE_URL}/movies/popular`, {
                        params: { page: currentPage }
                    });
                } else if (activeCategory === 'top-rated') {
                    response = await axios.get(`${API_BASE_URL}/movies/top-rated`, {
                        params: { page: currentPage }
                    });
                } else if (activeCategory === 'now-playing') {
                    response = await axios.get(`${API_BASE_URL}/movies/now-playing`, {
                        params: { page: currentPage }
                    });
                } else if (activeCategory === 'genre' && selectedCategoryGenre) {
                    response = await axios.get(`${API_BASE_URL}/movies/genre/${selectedCategoryGenre}`, {
                        params: { page: currentPage }
                    });
                }

                if (response) {
                    setMovies(response.data);
                    setFilteredMovies(response.data);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch movies');
                setLoading(false);
            }
        };

        fetchMovies();
    }, [activeCategory, selectedCategoryGenre, searchQuery, isSearchMode, currentPage]);

    // Apply local filters (genre and year) to displayed movies
    useEffect(() => {
        let filtered = movies;

        // Apply genre filter (local filter on displayed results)
        if (selectedGenre !== 'all') {
            filtered = filtered.filter(movie => movie.genre === selectedGenre);
        }

        // Apply year filter
        if (selectedYear !== 'all') {
            filtered = filtered.filter(movie => movie.year === parseInt(selectedYear));
        }

        setFilteredMovies(filtered);
    }, [selectedGenre, selectedYear, movies]);

    // Get unique genres from current movies
    const genres = Array.from(new Set(movies.map(movie => movie.genre)));

    // Get unique years from current movies, with fallback to full range
    const years = getYearsFromMovies(movies);

    // Handle search
    const handleSearch = () => {
        if (searchInputValue.trim() !== '') {
            setSearchQuery(searchInputValue);
            setIsSearchMode(true);
            setCurrentPage(1);
        }
    };

    // Handle search on Enter key
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Clear search and return to browse mode
    const handleClearSearch = () => {
        setSearchInputValue('');
        setSearchQuery('');
        setIsSearchMode(false);
        setCurrentPage(1);
    };

    // Handle category change
    const handleCategoryChange = (category: CategoryType, genreId?: number) => {
        setActiveCategory(category);
        setSelectedCategoryGenre(genreId || null);
        setIsSearchMode(false);
        setSearchInputValue('');
        setSearchQuery('');
        setCurrentPage(1);
        setSelectedGenre('all');
        setSelectedYear('all');
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎬 Movie List App</h1>
            </header>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by title, director, or actor..."
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                />
                <div className="search-buttons">
                    <button className="search-button" onClick={handleSearch}>
                        🔍 Search
                    </button>
                    {isSearchMode && (
                        <button className="clear-search-button" onClick={handleClearSearch}>
                            ✕ Clear Search
                        </button>
                    )}
                </div>
            </div>

            {!isSearchMode && (
                <div className="categories-container">
                    <div className="category-tabs">
                        <button
                            className={`category-tab ${activeCategory === 'popular' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('popular')}
                        >
                            🔥 Popular
                        </button>
                        <button
                            className={`category-tab ${activeCategory === 'top-rated' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('top-rated')}
                        >
                            ⭐ Top Rated
                        </button>
                        <button
                            className={`category-tab ${activeCategory === 'now-playing' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('now-playing')}
                        >
                            🎬 Now Playing
                        </button>
                        <div className="genre-dropdown-container">
                            <label htmlFor="category-genre">🎭 Genres:</label>
                            <select
                                id="category-genre"
                                className="genre-dropdown"
                                value={selectedCategoryGenre || ''}
                                onChange={(e) => {
                                    const genreId = parseInt(e.target.value);
                                    if (genreId) {
                                        handleCategoryChange('genre', genreId);
                                    }
                                }}
                            >
                                <option value="">Select Genre</option>
                                {availableGenres.map(genre => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="no-results">
                    {isSearchMode 
                        ? `No movies found for "${searchQuery}"`
                        : "No movies found with the selected filters."}
                </div>
            )}

            {!loading && filteredMovies.length > 0 && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button" 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;