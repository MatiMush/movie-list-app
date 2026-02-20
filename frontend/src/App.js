import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './App.css';
import { MovieContext } from './context/MovieContext';
import { useAuth } from './context/AuthContext';
import { getYearsFromMovies } from './utils/filters';
import Login from './components/Login';
import Register from './components/Register';
const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_LIST_NAMES = ['Favoritos', 'Interés'];
const App = () => {
    const movieContext = useContext(MovieContext);
    if (!movieContext) {
        throw new Error('App must be used within MovieProvider');
    }
    const { genres: availableGenres } = movieContext;
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [authView, setAuthView] = useState('login');
    const handleShowLogin = () => { setAuthView('login'); setShowAuth(true); };
    const handleShowRegister = () => { setAuthView('register'); setShowAuth(true); };
    const handleAuthSuccess = () => { setShowAuth(false); };
    const handleLogout = () => {
        logout();
        setFilteredMovies([]);
        setSearchInputValue('');
        setSearchQuery('');
        setIsSearchMode(false);
        setCurrentPage(1);
        setSelectedGenreFilter(null);
        setSelectedYearFilter(null);
        setFriends([]);
        setSharedLists([]);
        setFriendEmail('');
        setSelectedShareFriendByList({});
    };
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // New state for categories
    const [activeCategory, setActiveCategory] = useState('popular');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // New state for combined filters
    const [selectedGenreFilter, setSelectedGenreFilter] = useState(null);
    const [selectedYearFilter, setSelectedYearFilter] = useState(null);
    const [currentView, setCurrentView] = useState('browse');
    const [userLists, setUserLists] = useState([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [listActionMessage, setListActionMessage] = useState('');
    const [newListNameByMovie, setNewListNameByMovie] = useState({});
    const [selectedCustomListByMovie, setSelectedCustomListByMovie] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendEmail, setFriendEmail] = useState('');
    const [selectedShareFriendByList, setSelectedShareFriendByList] = useState({});
    const [sharedLists, setSharedLists] = useState([]);
    const getMovieYear = (movie) => {
        return movie.year || movie.release_date?.split('-')[0] || '';
    };
    const getMovieGenre = (movie) => {
        if (movie.genre) {
            return movie.genre;
        }
        if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
            const names = movie.genre_ids
                .map((id) => availableGenres.find(g => g.id === id)?.name)
                .filter(Boolean);
            return names.length > 0 ? names.slice(0, 2).join(', ') : 'Unknown';
        }
        return 'Unknown';
    };
    const normalizeMovie = (movie) => ({
        id: movie.id || movie.tmdbId,
        title: movie.title || movie.name || 'Untitled',
        genre: getMovieGenre(movie),
        year: getMovieYear(movie),
        description: movie.description || movie.overview || '',
        poster: movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''),
    });
    const fetchUserLists = async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            setListsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/lists`);
            setUserLists(response.data.lists || []);
        }
        catch (err) {
            setListActionMessage('No se pudieron cargar tus listas.');
        }
        finally {
            setListsLoading(false);
        }
    };
    const fetchSharedLists = async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/lists/shared/with-me`);
            setSharedLists(response.data.lists || []);
        }
        catch (err) {
            setListActionMessage('No se pudieron cargar listas compartidas.');
        }
    };
    const fetchFriends = async () => {
        if (!isAuthenticated) {
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/friends`);
            setFriends(response.data.friends || []);
        }
        catch (err) {
            setListActionMessage('No se pudieron cargar tus amigos.');
        }
    };
    const handleAddFriend = async () => {
        const email = friendEmail.trim().toLowerCase();
        if (!email) {
            setListActionMessage('Escribe un email para agregar un amigo.');
            return;
        }
        try {
            setListActionMessage('');
            const response = await axios.post(`${API_BASE_URL}/auth/friends/add`, { email });
            setFriends(response.data.friends || []);
            setFriendEmail('');
            setListActionMessage('Amigo agregado correctamente.');
        }
        catch (err) {
            setListActionMessage(err.response?.data?.message || 'No se pudo agregar al amigo.');
        }
    };
    const handleShareList = async (listId) => {
        const friendId = selectedShareFriendByList[listId];
        if (!friendId) {
            setListActionMessage('Selecciona un amigo para compartir la lista.');
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/lists/${listId}/share`, { friendId });
            setListActionMessage('Lista compartida correctamente.');
            await fetchSharedLists();
        }
        catch (err) {
            setListActionMessage(err.response?.data?.message || 'No se pudo compartir la lista.');
        }
    };
    const addMovieToList = async (listId, movie) => {
        await axios.post(`${API_BASE_URL}/lists/${listId}/movies`, {
            movie: {
                tmdbId: movie.id,
                title: movie.title,
                poster: movie.poster,
                year: movie.year,
                genre: movie.genre,
                mediaType: 'movie',
            }
        });
    };
    const createList = async (name) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/lists`, { name });
            return response.data.list;
        }
        catch (err) {
            setListActionMessage(err.response?.data?.message || 'No se pudo crear la lista.');
            return undefined;
        }
    };
    const handleAddToNamedList = async (movie, listName) => {
        if (!isAuthenticated) {
            setListActionMessage('Inicia sesión para guardar en listas.');
            return;
        }
        try {
            setListActionMessage('');
            let targetList = userLists.find(list => list.name.toLowerCase() === listName.toLowerCase());
            if (!targetList) {
                targetList = await createList(listName);
            }
            if (!targetList) {
                return;
            }
            await addMovieToList(targetList._id, movie);
            await fetchUserLists();
            setListActionMessage(`"${movie.title}" agregado a ${targetList.name}.`);
        }
        catch (err) {
            setListActionMessage(err.response?.data?.message || 'No se pudo agregar la película.');
        }
    };
    const handleCreateAndAddCustomList = async (movie) => {
        const rawName = newListNameByMovie[movie.id] || '';
        const listName = rawName.trim();
        if (!listName) {
            setListActionMessage('Escribe un nombre de lista para crearla.');
            return;
        }
        await handleAddToNamedList(movie, listName);
        setNewListNameByMovie(prev => ({ ...prev, [movie.id]: '' }));
    };
    const handleAddToSelectedCustomList = async (movie) => {
        const selectedListId = selectedCustomListByMovie[movie.id];
        if (!selectedListId) {
            setListActionMessage('Selecciona una lista personalizada.');
            return;
        }
        const targetList = userLists.find(list => list._id === selectedListId);
        if (!targetList) {
            setListActionMessage('La lista seleccionada ya no existe.');
            return;
        }
        await handleAddToNamedList(movie, targetList.name);
    };
    const handleRemoveFromList = async (listId, tmdbId) => {
        try {
            await axios.delete(`${API_BASE_URL}/lists/${listId}/movies/${tmdbId}`);
            await fetchUserLists();
            setListActionMessage('Elemento eliminado de la lista.');
        }
        catch (err) {
            setListActionMessage(err.response?.data?.message || 'No se pudo eliminar el elemento.');
        }
    };
    const customLists = userLists.filter(list => !DEFAULT_LIST_NAMES.includes(list.name));
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserLists();
            fetchFriends();
            fetchSharedLists();
        }
        else {
            setUserLists([]);
            setFriends([]);
            setSharedLists([]);
            setCurrentView('browse');
        }
    }, [isAuthenticated]);
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
                if (response) {
                    const normalizedResults = (response.data.results || []).map(normalizeMovie);
                    setFilteredMovies(prev => currentPage > 1 ? [...prev, ...normalizedResults] : normalizedResults);
                }
                setLoading(false);
            }
            catch (err) {
                setError('Failed to fetch movies');
                setLoading(false);
            }
        };
        fetchMovies();
    }, [activeCategory, searchQuery, isSearchMode, currentPage, selectedGenreFilter, selectedYearFilter, availableGenres]);
    // Get unique years - always returns full range (1900-current year)
    const years = getYearsFromMovies([]);
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
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
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
    return (_jsxs("div", { className: "app", children: [showAuth && authView === 'login' && (_jsx(Login, { onSuccess: handleAuthSuccess, onSwitchToRegister: handleShowRegister })), showAuth && authView === 'register' && (_jsx(Register, { onSuccess: handleAuthSuccess, onSwitchToLogin: handleShowLogin })), !showAuth && (_jsxs(_Fragment, { children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "\uD83C\uDFAC Movie List App" }), _jsx("div", { className: "user-section", children: authLoading ? null : isAuthenticated && user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "welcome-message", children: ["Welcome, ", user.name, "! \uD83D\uDC4B"] }), _jsx("button", { className: "login-button", onClick: () => setCurrentView(currentView === 'browse' ? 'user' : 'browse'), children: currentView === 'browse' ? 'Mi página' : 'Explorar' }), _jsx("button", { className: "logout-button", onClick: handleLogout, children: "Logout" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: "login-button", onClick: handleShowLogin, children: "Login" }), _jsx("button", { className: "register-button", onClick: handleShowRegister, children: "Register" })] })) })] }), isAuthenticated && currentView === 'user' && (_jsxs("div", { className: "user-page-card", children: [_jsx("h2", { children: "\uD83D\uDC64 Mi P\u00E1gina" }), _jsx("p", { className: "user-page-subtitle", children: "Tus listas guardadas de pel\u00EDculas y series." }), listActionMessage && _jsx("div", { className: "results-info", children: listActionMessage }), _jsxs("div", { className: "friends-panel", children: [_jsx("h3", { children: "\uD83D\uDC65 Amigos" }), _jsxs("div", { className: "friend-add-row", children: [_jsx("input", { type: "email", placeholder: "Email del amigo", value: friendEmail, onChange: (e) => setFriendEmail(e.target.value) }), _jsx("button", { onClick: handleAddFriend, children: "Agregar amigo" })] }), _jsx("div", { className: "friends-list-inline", children: friends.length === 0 ? 'Sin amigos todavía.' : friends.map(friend => friend.name).join(', ') })] }), listsLoading ? (_jsx("div", { className: "loading", children: "Cargando listas..." })) : userLists.length === 0 ? (_jsx("div", { className: "no-results", children: "No tienes listas todav\u00EDa." })) : (_jsx("div", { className: "user-lists-grid", children: userLists.map(list => (_jsxs("div", { className: "user-list-card", children: [_jsx("h3", { children: list.name }), _jsxs("p", { children: [list.items.length, " elemento", list.items.length !== 1 ? 's' : ''] }), _jsxs("div", { className: "share-row", children: [_jsxs("select", { value: selectedShareFriendByList[list._id] || '', onChange: (e) => setSelectedShareFriendByList(prev => ({ ...prev, [list._id]: e.target.value })), children: [_jsx("option", { value: "", children: "Compartir con amigo..." }), friends.map(friend => (_jsx("option", { value: friend._id, children: friend.name }, friend._id)))] }), _jsx("button", { onClick: () => handleShareList(list._id), children: "Compartir" })] }), list.items.length === 0 ? (_jsx("div", { className: "empty-list", children: "Lista vac\u00EDa" })) : (_jsx("div", { className: "saved-items", children: list.items.map(item => (_jsxs("div", { className: "saved-item-row", children: [_jsxs("div", { className: "saved-item-main", children: [item.poster ? _jsx("img", { src: item.poster, alt: item.title, className: "saved-item-cover" }) : null, _jsxs("span", { children: [item.title, " ", item.year ? `(${item.year})` : ''] })] }), _jsx("button", { className: "mini-remove-button", onClick: () => handleRemoveFromList(list._id, item.tmdbId), children: "Quitar" })] }, `${list._id}-${item.tmdbId}`))) }))] }, list._id))) })), _jsx("h3", { className: "shared-lists-title", children: "\uD83D\uDCE8 Listas compartidas conmigo" }), sharedLists.length === 0 ? (_jsx("div", { className: "empty-list", children: "Todav\u00EDa no tienes listas compartidas." })) : (_jsx("div", { className: "user-lists-grid", children: sharedLists.map(list => (_jsxs("div", { className: "user-list-card", children: [_jsx("h3", { children: list.name }), _jsxs("p", { children: ["Compartida por ", (typeof list.userId === 'object' && list.userId?.name) ? list.userId.name : 'otro usuario'] }), _jsx("div", { className: "saved-items", children: list.items.map(item => (_jsx("div", { className: "saved-item-row", children: _jsxs("div", { className: "saved-item-main", children: [item.poster ? _jsx("img", { src: item.poster, alt: item.title, className: "saved-item-cover" }) : null, _jsxs("span", { children: [item.title, " ", item.year ? `(${item.year})` : ''] })] }) }, `shared-${list._id}-${item.tmdbId}`))) })] }, `shared-${list._id}`))) }))] })), currentView === 'browse' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "search-container", children: [_jsx("input", { type: "text", className: "search-input", placeholder: "Search by title, director, or actor...", value: searchInputValue, onChange: (e) => setSearchInputValue(e.target.value), onKeyDown: handleSearchKeyPress }), _jsxs("div", { className: "search-buttons", children: [_jsx("button", { className: "search-button", onClick: handleSearch, children: "\uD83D\uDD0D Search" }), isSearchMode && (_jsx("button", { className: "clear-search-button", onClick: handleClearSearch, children: "\u2715 Clear Search" }))] })] }), !isSearchMode && (_jsx("div", { className: "categories-container", children: _jsxs("div", { className: "category-tabs", children: [_jsx("button", { className: `category-tab ${activeCategory === 'popular' ? 'active' : ''}`, onClick: () => handleCategoryChange('popular'), children: "\uD83D\uDD25 Popular" }), _jsx("button", { className: `category-tab ${activeCategory === 'top-rated' ? 'active' : ''}`, onClick: () => handleCategoryChange('top-rated'), children: "\u2B50 Top Rated" }), _jsx("button", { className: `category-tab ${activeCategory === 'now-playing' ? 'active' : ''}`, onClick: () => handleCategoryChange('now-playing'), children: "\uD83C\uDFAC Now Playing" })] }) })), _jsxs("div", { className: "filters-combined", children: [_jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "genre-filter", children: "\uD83C\uDFAD Filter by Genre:" }), _jsxs("select", { id: "genre-filter", value: selectedGenreFilter || '', onChange: (e) => handleGenreFilterChange(e.target.value ? parseInt(e.target.value) : null), children: [_jsx("option", { value: "", children: "All Genres" }), availableGenres.map(genre => (_jsx("option", { value: genre.id, children: genre.name }, genre.id)))] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { htmlFor: "year-filter", children: "\uD83D\uDCC5 Filter by Year:" }), _jsxs("select", { id: "year-filter", value: selectedYear, onChange: (e) => handleYearFilterChange(e.target.value), children: [_jsx("option", { value: "all", children: "All Years" }), years.map(year => (_jsx("option", { value: year, children: year }, year)))] })] })] }), loading && _jsx("div", { className: "loading", children: "Loading movies..." }), error && _jsx("div", { className: "error", children: error }), !loading && filteredMovies.length > 0 && (_jsxs("div", { className: "results-info", children: ["Showing ", filteredMovies.length, " movie", filteredMovies.length !== 1 ? 's' : '', (selectedGenreFilter || selectedYearFilter) && ' matching your filters'] })), _jsx("div", { className: "movies-grid", children: Array.isArray(filteredMovies) && filteredMovies.map(movie => (_jsxs("div", { className: "movie-card", children: [_jsx("div", { className: "movie-poster", children: _jsx("img", { src: movie.poster, alt: movie.title }) }), _jsxs("div", { className: "movie-info", children: [_jsx("h3", { className: "movie-title", children: movie.title }), _jsxs("div", { className: "movie-meta", children: [_jsx("span", { className: "movie-genre", children: movie.genre }), _jsx("span", { className: "movie-year", children: movie.year })] }), _jsx("p", { className: "movie-description", children: movie.description }), isAuthenticated && (_jsxs("div", { className: "movie-list-actions", children: [_jsxs("div", { className: "quick-list-buttons", children: [_jsx("button", { onClick: () => handleAddToNamedList(movie, 'Favoritos'), children: "\u2764\uFE0F Favoritos" }), _jsx("button", { onClick: () => handleAddToNamedList(movie, 'Interés'), children: "\uD83D\uDC40 Inter\u00E9s" })] }), _jsxs("div", { className: "custom-list-row", children: [_jsxs("select", { value: selectedCustomListByMovie[movie.id] || '', onChange: (e) => setSelectedCustomListByMovie(prev => ({ ...prev, [movie.id]: e.target.value })), children: [_jsx("option", { value: "", children: "Elegir lista" }), customLists.map(list => (_jsx("option", { value: list._id, children: list.name }, list._id)))] }), _jsx("button", { onClick: () => handleAddToSelectedCustomList(movie), children: "A\u00F1adir" })] }), _jsxs("div", { className: "custom-list-row", children: [_jsx("input", { type: "text", placeholder: "Nueva lista", value: newListNameByMovie[movie.id] || '', onChange: (e) => setNewListNameByMovie(prev => ({ ...prev, [movie.id]: e.target.value })) }), _jsx("button", { onClick: () => handleCreateAndAddCustomList(movie), children: "Crear + a\u00F1adir" })] })] }))] })] }, movie.id))) }), filteredMovies.length === 0 && !loading && !error && (_jsx("div", { className: "no-results", children: isSearchMode
                                    ? `No movies found for "${searchQuery}"`
                                    : "No movies found with the selected filters." })), !loading && filteredMovies.length > 0 && (_jsx("div", { className: "load-more-container", children: _jsx("button", { className: "load-more-button", onClick: () => setCurrentPage(prev => prev + 1), children: "Load More" }) }))] }))] }))] }));
};
export default App;
