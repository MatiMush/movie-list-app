import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './App.css';
import { MovieContext } from './context/MovieContext';
import { useAuth } from './context/AuthContext';
import { getYearsFromMovies } from './utils/filters';
import Login from './components/Login';
import Register from './components/Register';

interface Movie {
    id: number;
    title: string;
    genre: string;
    year: string;
    description: string;
    poster: string;
}

interface ListItem {
    tmdbId: number;
    title: string;
    poster?: string;
    year?: string;
    genre?: string;
    mediaType?: 'movie' | 'series';
}

interface UserList {
    _id: string;
    name: string;
    items: ListItem[];
    userId?: { _id: string; name: string; email: string } | string;
}

interface Friend {
    _id: string;
    name: string;
    email: string;
}

type CategoryType = 'popular' | 'top-rated' | 'now-playing';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_LIST_NAMES = ['Favoritos', 'Interés'];

const App: React.FC = () => {
    const movieContext = useContext(MovieContext);
    
    if (!movieContext) {
        throw new Error('App must be used within MovieProvider');
    }
    
    const { genres: availableGenres } = movieContext;
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    
    const [showAuth, setShowAuth] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

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
    
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    // New state for categories
    const [activeCategory, setActiveCategory] = useState<CategoryType>('popular');
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // New state for combined filters
    const [selectedGenreFilter, setSelectedGenreFilter] = useState<number | null>(null);
    const [selectedYearFilter, setSelectedYearFilter] = useState<number | null>(null);
    const [currentView, setCurrentView] = useState<'browse' | 'user'>('browse');
    const [userLists, setUserLists] = useState<UserList[]>([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [listActionMessage, setListActionMessage] = useState<string>('');
    const [newListNameByMovie, setNewListNameByMovie] = useState<Record<number, string>>({});
    const [selectedCustomListByMovie, setSelectedCustomListByMovie] = useState<Record<number, string>>({});
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendEmail, setFriendEmail] = useState('');
    const [selectedShareFriendByList, setSelectedShareFriendByList] = useState<Record<string, string>>({});
    const [sharedLists, setSharedLists] = useState<UserList[]>([]);

    const getMovieYear = (movie: any): string => {
        return movie.year || movie.release_date?.split('-')[0] || '';
    };

    const getMovieGenre = (movie: any): string => {
        if (movie.genre) {
            return movie.genre;
        }

        if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
            const names = movie.genre_ids
                .map((id: number) => availableGenres.find(g => g.id === id)?.name)
                .filter(Boolean);
            return names.length > 0 ? names.slice(0, 2).join(', ') : 'Unknown';
        }

        return 'Unknown';
    };

    const normalizeMovie = (movie: any): Movie => ({
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
        } catch (err) {
            setListActionMessage('No se pudieron cargar tus listas.');
        } finally {
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
        } catch (err) {
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
        } catch (err) {
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
        } catch (err: any) {
            setListActionMessage(err.response?.data?.message || 'No se pudo agregar al amigo.');
        }
    };

    const handleShareList = async (listId: string) => {
        const friendId = selectedShareFriendByList[listId];

        if (!friendId) {
            setListActionMessage('Selecciona un amigo para compartir la lista.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/lists/${listId}/share`, { friendId });
            setListActionMessage('Lista compartida correctamente.');
            await fetchSharedLists();
        } catch (err: any) {
            setListActionMessage(err.response?.data?.message || 'No se pudo compartir la lista.');
        }
    };

    const addMovieToList = async (listId: string, movie: Movie) => {
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

    const createList = async (name: string): Promise<UserList | undefined> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/lists`, { name });
            return response.data.list;
        } catch (err: any) {
            setListActionMessage(err.response?.data?.message || 'No se pudo crear la lista.');
            return undefined;
        }
    };

    const handleAddToNamedList = async (movie: Movie, listName: string) => {
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
        } catch (err: any) {
            setListActionMessage(err.response?.data?.message || 'No se pudo agregar la película.');
        }
    };

    const handleCreateAndAddCustomList = async (movie: Movie) => {
        const rawName = newListNameByMovie[movie.id] || '';
        const listName = rawName.trim();

        if (!listName) {
            setListActionMessage('Escribe un nombre de lista para crearla.');
            return;
        }

        await handleAddToNamedList(movie, listName);
        setNewListNameByMovie(prev => ({ ...prev, [movie.id]: '' }));
    };

    const handleAddToSelectedCustomList = async (movie: Movie) => {
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

    const handleRemoveFromList = async (listId: string, tmdbId: number) => {
        try {
            await axios.delete(`${API_BASE_URL}/lists/${listId}/movies/${tmdbId}`);
            await fetchUserLists();
            setListActionMessage('Elemento eliminado de la lista.');
        } catch (err: any) {
            setListActionMessage(err.response?.data?.message || 'No se pudo eliminar el elemento.');
        }
    };

    const customLists = userLists.filter(list => !DEFAULT_LIST_NAMES.includes(list.name));

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserLists();
            fetchFriends();
            fetchSharedLists();
        } else {
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
                } else if (isSearchMode && searchQuery.trim() !== '') {
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
                }

                if (response) {
                    const normalizedResults = (response.data.results || []).map(normalizeMovie);
                    setFilteredMovies(prev => currentPage > 1 ? [...prev, ...normalizedResults] : normalizedResults);
                }
                setLoading(false);
            } catch (err) {
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
    const handleCategoryChange = (category: CategoryType) => {
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
    const handleGenreFilterChange = (genreId: number | null) => {
        setSelectedGenreFilter(genreId);
        setCurrentPage(1); // Reset to first page
    };
    
    // Handle year filter change
    const handleYearFilterChange = (year: string) => {
        setSelectedYear(year);
        setSelectedYearFilter(year === 'all' ? null : parseInt(year));
        setCurrentPage(1); // Reset to first page
    };

    return (
        <div className="app">
            {showAuth && authView === 'login' && (
                <Login onSuccess={handleAuthSuccess} onSwitchToRegister={handleShowRegister} />
            )}
            {showAuth && authView === 'register' && (
                <Register onSuccess={handleAuthSuccess} onSwitchToLogin={handleShowLogin} />
            )}
            {!showAuth && (
            <>
            <header className="app-header">
                <h1>🎬 Movie List App</h1>
                <div className="user-section">
                    {authLoading ? null : isAuthenticated && user ? (
                        <>
                            <span className="welcome-message">Welcome, {user.name}! 👋</span>
                            <button className="login-button" onClick={() => setCurrentView(currentView === 'browse' ? 'user' : 'browse')}>
                                {currentView === 'browse' ? 'Mi página' : 'Explorar'}
                            </button>
                            <button className="logout-button" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="login-button" onClick={handleShowLogin}>Login</button>
                            <button className="register-button" onClick={handleShowRegister}>Register</button>
                        </>
                    )}
                </div>
            </header>

            {isAuthenticated && currentView === 'user' && (
                <div className="user-page-card">
                    <h2>👤 Mi Página</h2>
                    <p className="user-page-subtitle">Tus listas guardadas de películas y series.</p>
                    {listActionMessage && <div className="results-info">{listActionMessage}</div>}
                    <div className="friends-panel">
                        <h3>👥 Amigos</h3>
                        <div className="friend-add-row">
                            <input
                                type="email"
                                placeholder="Email del amigo"
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                            />
                            <button onClick={handleAddFriend}>Agregar amigo</button>
                        </div>
                        <div className="friends-list-inline">
                            {friends.length === 0 ? 'Sin amigos todavía.' : friends.map(friend => friend.name).join(', ')}
                        </div>
                    </div>
                    {listsLoading ? (
                        <div className="loading">Cargando listas...</div>
                    ) : userLists.length === 0 ? (
                        <div className="no-results">No tienes listas todavía.</div>
                    ) : (
                        <div className="user-lists-grid">
                            {userLists.map(list => (
                                <div key={list._id} className="user-list-card">
                                    <h3>{list.name}</h3>
                                    <p>{list.items.length} elemento{list.items.length !== 1 ? 's' : ''}</p>
                                    <div className="share-row">
                                        <select
                                            value={selectedShareFriendByList[list._id] || ''}
                                            onChange={(e) => setSelectedShareFriendByList(prev => ({ ...prev, [list._id]: e.target.value }))}
                                        >
                                            <option value="">Compartir con amigo...</option>
                                            {friends.map(friend => (
                                                <option key={friend._id} value={friend._id}>{friend.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleShareList(list._id)}>Compartir</button>
                                    </div>
                                    {list.items.length === 0 ? (
                                        <div className="empty-list">Lista vacía</div>
                                    ) : (
                                        <div className="saved-items">
                                            {list.items.map(item => (
                                                <div key={`${list._id}-${item.tmdbId}`} className="saved-item-row">
                                                    <div className="saved-item-main">
                                                        {item.poster ? <img src={item.poster} alt={item.title} className="saved-item-cover" /> : null}
                                                        <span>{item.title} {item.year ? `(${item.year})` : ''}</span>
                                                    </div>
                                                    <button
                                                        className="mini-remove-button"
                                                        onClick={() => handleRemoveFromList(list._id, item.tmdbId)}
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 className="shared-lists-title">📨 Listas compartidas conmigo</h3>
                    {sharedLists.length === 0 ? (
                        <div className="empty-list">Todavía no tienes listas compartidas.</div>
                    ) : (
                        <div className="user-lists-grid">
                            {sharedLists.map(list => (
                                <div key={`shared-${list._id}`} className="user-list-card">
                                    <h3>{list.name}</h3>
                                    <p>Compartida por {(typeof list.userId === 'object' && list.userId?.name) ? list.userId.name : 'otro usuario'}</p>
                                    <div className="saved-items">
                                        {list.items.map(item => (
                                            <div key={`shared-${list._id}-${item.tmdbId}`} className="saved-item-row">
                                                <div className="saved-item-main">
                                                    {item.poster ? <img src={item.poster} alt={item.title} className="saved-item-cover" /> : null}
                                                    <span>{item.title} {item.year ? `(${item.year})` : ''}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {currentView === 'browse' && (
            <>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by title, director, or actor..."
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
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
                    </div>
                </div>
            )}

            <div className="filters-combined">
                <div className="filter-group">
                    <label htmlFor="genre-filter">🎭 Filter by Genre:</label>
                    <select
                        id="genre-filter"
                        value={selectedGenreFilter || ''}
                        onChange={(e) => handleGenreFilterChange(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Genres</option>
                        {availableGenres.map(genre => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="year-filter">📅 Filter by Year:</label>
                    <select
                        id="year-filter"
                        value={selectedYear}
                        onChange={(e) => handleYearFilterChange(e.target.value)}
                    >
                        <option value="all">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <div className="loading">Loading movies...</div>}
            {error && <div className="error">{error}</div>}
            
            {!loading && filteredMovies.length > 0 && (
                <div className="results-info">
                    Showing {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
                    {(selectedGenreFilter || selectedYearFilter) && ' matching your filters'}
                </div>
            )}

            <div className="movies-grid">
                {Array.isArray(filteredMovies) && filteredMovies.map(movie => (
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
                            {isAuthenticated && (
                                <div className="movie-list-actions">
                                    <div className="quick-list-buttons">
                                        <button onClick={() => handleAddToNamedList(movie, 'Favoritos')}>❤️ Favoritos</button>
                                        <button onClick={() => handleAddToNamedList(movie, 'Interés')}>👀 Interés</button>
                                    </div>
                                    <div className="custom-list-row">
                                        <select
                                            value={selectedCustomListByMovie[movie.id] || ''}
                                            onChange={(e) => setSelectedCustomListByMovie(prev => ({ ...prev, [movie.id]: e.target.value }))}
                                        >
                                            <option value="">Elegir lista</option>
                                            {customLists.map(list => (
                                                <option key={list._id} value={list._id}>{list.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleAddToSelectedCustomList(movie)}>Añadir</button>
                                    </div>
                                    <div className="custom-list-row">
                                        <input
                                            type="text"
                                            placeholder="Nueva lista"
                                            value={newListNameByMovie[movie.id] || ''}
                                            onChange={(e) => setNewListNameByMovie(prev => ({ ...prev, [movie.id]: e.target.value }))}
                                        />
                                        <button onClick={() => handleCreateAndAddCustomList(movie)}>Crear + añadir</button>
                                    </div>
                                </div>
                            )}
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
            </>
            )}
            </>
            )}
        </div>
    );
};

export default App;