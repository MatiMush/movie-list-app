import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
const API_BASE_URL = 'http://localhost:5000/api';
const App = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // New state for categories
    const [activeCategory, setActiveCategory] = useState('popular');
    const [selectedCategoryGenre, setSelectedCategoryGenre] = useState(null);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Fetch available genres from backend
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/genres`);
                setAvailableGenres(response.data);
            }
            catch (err) {
                console.error('Failed to fetch genres:', err);
            }
        };
        fetchGenres();
    }, []);
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
                }
                else if (activeCategory === 'popular') {
                    response = await axios.get(`${API_BASE_URL}/movies/popular`, {
                        params: { page: currentPage }
                    });
                }
                else if (activeCategory === 'top-rated') {
                    response = await axios.get(`${API_BASE_URL}/movies/top-rated`, {
                        params: { page: currentPage }
                    });
                }
                else if (activeCategory === 'now-playing') {
                    response = await axios.get(`${API_BASE_URL}/movies/now-playing`, {
                        params: { page: currentPage }
                    });
                }
                else if (activeCategory === 'genre' && selectedCategoryGenre) {
                    response = await axios.get(`${API_BASE_URL}/movies/genre/${selectedCategoryGenre}`, {
                        params: { page: currentPage }
                    });
                }
                if (response) {
                    setMovies(response.data);
                    setFilteredMovies(response.data);
                }
                setLoading(false);
            }
            catch (err) {
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
    // Get unique years from current movies
    const years = Array.from(new Set(movies.map(movie => movie.year))).sort((a, b) => b - a);
    // Handle search
    const handleSearch = () => {
        if (searchInputValue.trim() !== '') {
            setSearchQuery(searchInputValue);
            setIsSearchMode(true);
            setCurrentPage(1);
        }
    };
    // Handle search on Enter key
    const handleSearchKeyPress = (e) => {
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
    const handleCategoryChange = (category, genreId) => {
        setActiveCategory(category);
        setSelectedCategoryGenre(genreId || null);
        setIsSearchMode(false);
        setSearchInputValue('');
        setSearchQuery('');
        setCurrentPage(1);
        setSelectedGenre('all');
        setSelectedYear('all');
    };
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsx("h1", { children: "\uD83C\uDFAC Movie List App" }) }), _jsxs("div", { className: "search-container", children: [_jsx("input", { type: "text", className: "search-input", placeholder: "Search by title, director, or actor...", value: searchInputValue, onChange: (e) => setSearchInputValue(e.target.value), onKeyPress: handleSearchKeyPress }), _jsxs("div", { className: "search-buttons", children: [_jsx("button", { className: "search-button", onClick: handleSearch, children: "\uD83D\uDD0D Search" }), isSearchMode && (_jsx("button", { className: "clear-search-button", onClick: handleClearSearch, children: "\u2715 Clear Search" }))] })] }), !isSearchMode && (_jsx("div", { className: "categories-container", children: _jsxs("div", { className: "category-tabs", children: [_jsx("button", { className: `category-tab ${activeCategory === 'popular' ? 'active' : ''}`, onClick: () => handleCategoryChange('popular'), children: "\uD83D\uDD25 Popular" }), _jsx("button", { className: `category-tab ${activeCategory === 'top-rated' ? 'active' : ''}`, onClick: () => handleCategoryChange('top-rated'), children: "\u2B50 Top Rated" }), _jsx("button", { className: `category-tab ${activeCategory === 'now-playing' ? 'active' : ''}`, onClick: () => handleCategoryChange('now-playing'), children: "\uD83C\uDFAC Now Playing" }), _jsxs("div", { className: "genre-dropdown-container", children: [_jsx("label", { htmlFor: "category-genre", children: "\uD83C\uDFAD Genres:" }), _jsxs("select", { id: "category-genre", className: "genre-dropdown", value: selectedCategoryGenre || '', onChange: (e) => {
                                        const genreId = parseInt(e.target.value);
                                        if (genreId) {
                                            handleCategoryChange('genre', genreId);
                                        }
                                    }, children: [_jsx("option", { value: "", children: "Select Genre" }), availableGenres.map(genre => (_jsx("option", { value: genre.id, children: genre.name }, genre.id)))] })] })] }) })), _jsxs("div", { className: "filters", children: [_jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "genre-filter", children: "Filter by Genre:" }), _jsxs("select", { id: "genre-filter", value: selectedGenre, onChange: (e) => setSelectedGenre(e.target.value), children: [_jsx("option", { value: "all", children: "Show All" }), genres.map(genre => (_jsx("option", { value: genre, children: genre }, genre)))] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "year-filter", children: "Filter by Year:" }), _jsxs("select", { id: "year-filter", value: selectedYear, onChange: (e) => setSelectedYear(e.target.value), children: [_jsx("option", { value: "all", children: "Show All" }), years.map(year => (_jsx("option", { value: year, children: year }, year)))] })] })] }), loading && _jsx("div", { className: "loading", children: "Loading movies..." }), error && _jsx("div", { className: "error", children: error }), _jsx("div", { className: "movies-grid", children: filteredMovies.map(movie => (_jsxs("div", { className: "movie-card", children: [_jsx("div", { className: "movie-poster", children: _jsx("img", { src: movie.poster, alt: movie.title }) }), _jsxs("div", { className: "movie-info", children: [_jsx("h3", { className: "movie-title", children: movie.title }), _jsxs("div", { className: "movie-meta", children: [_jsx("span", { className: "movie-genre", children: movie.genre }), _jsx("span", { className: "movie-year", children: movie.year })] }), _jsx("p", { className: "movie-description", children: movie.description })] })] }, movie.id))) }), filteredMovies.length === 0 && !loading && !error && (_jsx("div", { className: "no-results", children: isSearchMode
                    ? `No movies found for "${searchQuery}"`
                    : "No movies found with the selected filters." })), !loading && filteredMovies.length > 0 && currentPage === 1 && (_jsx("div", { className: "load-more-container", children: _jsx("button", { className: "load-more-button", onClick: () => setCurrentPage(prev => prev + 1), children: "Load More" }) }))] }));
};
export default App;
