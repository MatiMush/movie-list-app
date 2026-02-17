import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './App.css';
import { MovieContext } from './context/MovieContext';
import { getYearsFromMovies } from './utils/filters';
const API_BASE_URL = 'http://localhost:5000/api';
const App = () => {
    const movieContext = useContext(MovieContext);
    if (!movieContext) {
        throw new Error('App must be used within MovieProvider');
    }
    const { genres: availableGenres } = movieContext;
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // New state for categories
    const [activeCategory, setActiveCategory] = useState('popular');
    const [selectedCategoryGenre, setSelectedCategoryGenre] = useState(null);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // New state for combined filters
    const [selectedGenreFilter, setSelectedGenreFilter] = useState(null);
    const [selectedYearFilter, setSelectedYearFilter] = useState(null);
    // Fetch movies based on category or search
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError('');
                let response;
                // If filters are active (genre or year), use discover endpoint
                if (selectedGenreFilter || selectedYearFilter) {
                    response = await axios.get(`${API_BASE_URL}/movies/discover`, {
                        params: {
                            genre: selectedGenreFilter,
                            year: selectedYearFilter,
                            page: currentPage
                        }
                    });
                }
                else if (isSearchMode && searchQuery.trim() !== '') {
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
    }, [activeCategory, selectedCategoryGenre, searchQuery, isSearchMode, currentPage, selectedGenreFilter, selectedYearFilter]);
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
        setSelectedYear('all');
        // Reset combined filters when switching categories
        setSelectedGenreFilter(null);
        setSelectedYearFilter(null);
    };
    // Handle genre filter change
    const handleGenreFilterChange = (genreId) => {
        setSelectedGenreFilter(genreId);
        setCurrentPage(1); // Reset to first page
    };
    // Handle year filter change
    const handleYearFilterChange = (year) => {
        setSelectedYear(year);
        setSelectedYearFilter(year === 'all' ? null : parseInt(year));
        setCurrentPage(1); // Reset to first page
    };
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsx("h1", { children: "\uD83C\uDFAC Movie List App" }) }), _jsxs("div", { className: "search-container", children: [_jsx("input", { type: "text", className: "search-input", placeholder: "Search by title, director, or actor...", value: searchInputValue, onChange: (e) => setSearchInputValue(e.target.value), onKeyPress: handleSearchKeyPress }), _jsxs("div", { className: "search-buttons", children: [_jsx("button", { className: "search-button", onClick: handleSearch, children: "\uD83D\uDD0D Search" }), isSearchMode && (_jsx("button", { className: "clear-search-button", onClick: handleClearSearch, children: "\u2715 Clear Search" }))] })] }), !isSearchMode && (_jsx("div", { className: "categories-container", children: _jsxs("div", { className: "category-tabs", children: [_jsx("button", { className: `category-tab ${activeCategory === 'popular' ? 'active' : ''}`, onClick: () => handleCategoryChange('popular'), children: "\uD83D\uDD25 Popular" }), _jsx("button", { className: `category-tab ${activeCategory === 'top-rated' ? 'active' : ''}`, onClick: () => handleCategoryChange('top-rated'), children: "\u2B50 Top Rated" }), _jsx("button", { className: `category-tab ${activeCategory === 'now-playing' ? 'active' : ''}`, onClick: () => handleCategoryChange('now-playing'), children: "\uD83C\uDFAC Now Playing" }), _jsxs("div", { className: "genre-dropdown-container", children: [_jsx("label", { htmlFor: "category-genre", children: "\uD83C\uDFAD Genres:" }), _jsxs("select", { id: "category-genre", className: "genre-dropdown", value: selectedCategoryGenre || '', onChange: (e) => {
                                        const genreId = parseInt(e.target.value);
                                        if (genreId) {
                                            handleCategoryChange('genre', genreId);
                                        }
                                    }, children: [_jsx("option", { value: "", children: "Select Genre" }), availableGenres.map(genre => (_jsx("option", { value: genre.id, children: genre.name }, genre.id)))] })] })] }) })), _jsxs("div", { className: "filters-combined", children: [_jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "genre-filter", children: "\uD83C\uDFAD Filter by Genre:" }), _jsxs("select", { id: "genre-filter", value: selectedGenreFilter || '', onChange: (e) => handleGenreFilterChange(e.target.value ? parseInt(e.target.value) : null), children: [_jsx("option", { value: "", children: "All Genres" }), availableGenres.map(genre => (_jsx("option", { value: genre.id, children: genre.name }, genre.id)))] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "year-filter", children: "\uD83D\uDCC5 Filter by Year:" }), _jsxs("select", { id: "year-filter", value: selectedYear, onChange: (e) => handleYearFilterChange(e.target.value), children: [_jsx("option", { value: "all", children: "All Years" }), years.map(year => (_jsx("option", { value: year, children: year }, year)))] })] })] }), loading && _jsx("div", { className: "loading", children: "Loading movies..." }), error && _jsx("div", { className: "error", children: error }), !loading && filteredMovies.length > 0 && (_jsxs("div", { className: "results-info", children: ["Showing ", filteredMovies.length, " movie", filteredMovies.length !== 1 ? 's' : '', (selectedGenreFilter || selectedYearFilter) && ' matching your filters'] })), _jsx("div", { className: "movies-grid", children: filteredMovies.map(movie => (_jsxs("div", { className: "movie-card", children: [_jsx("div", { className: "movie-poster", children: _jsx("img", { src: movie.poster, alt: movie.title }) }), _jsxs("div", { className: "movie-info", children: [_jsx("h3", { className: "movie-title", children: movie.title }), _jsxs("div", { className: "movie-meta", children: [_jsx("span", { className: "movie-genre", children: movie.genre }), _jsx("span", { className: "movie-year", children: movie.year })] }), _jsx("p", { className: "movie-description", children: movie.description })] })] }, movie.id))) }), filteredMovies.length === 0 && !loading && !error && (_jsx("div", { className: "no-results", children: isSearchMode
                    ? `No movies found for "${searchQuery}"`
                    : "No movies found with the selected filters." })), !loading && filteredMovies.length > 0 && (_jsx("div", { className: "load-more-container", children: _jsx("button", { className: "load-more-button", onClick: () => setCurrentPage(prev => prev + 1), children: "Load More" }) }))] }));
};
export default App;
