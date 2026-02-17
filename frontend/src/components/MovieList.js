import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useContext } from 'react';
import '../styles/MovieList.css';
import { MovieContext } from '../context/MovieContext';
import { AuthContext } from '../context/AuthContext';
const MovieList = () => {
    const [movies, setMovies] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [rating, setRating] = useState(5);
    const [error, setError] = useState('');
    const { getAllMovies, addMovie, deleteMovie } = useContext(MovieContext);
    const { user } = useContext(AuthContext);
    useEffect(() => {
        fetchMovies();
    }, []);
    const fetchMovies = async () => {
        try {
            const data = await getAllMovies();
            setMovies(data);
        }
        catch (err) {
            setError('Error al cargar películas');
        }
    };
    const handleAddMovie = async (e) => {
        e.preventDefault();
        try {
            await addMovie({ title, description, releaseDate, rating });
            setTitle('');
            setDescription('');
            setReleaseDate('');
            setRating(5);
            fetchMovies();
        }
        catch (err) {
            setError('Error al agregar película');
        }
    };
    const handleDeleteMovie = async (id) => {
        try {
            await deleteMovie(id);
            fetchMovies();
        }
        catch (err) {
            setError('Error al eliminar película');
        }
    };
    return (_jsxs("div", { className: "movie-list-container", children: [_jsx("h1", { children: "\uD83C\uDFAC Mi Lista de Pel\u00EDculas" }), error && _jsx("p", { className: "error", children: error }), user && (_jsxs("form", { onSubmit: handleAddMovie, className: "movie-form", children: [_jsx("h2", { children: "Agregar Nueva Pel\u00EDcula" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "T\u00EDtulo:" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Descripci\u00F3n:" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Fecha de Estreno:" }), _jsx("input", { type: "date", value: releaseDate, onChange: (e) => setReleaseDate(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Calificaci\u00F3n (1-10):" }), _jsx("input", { type: "number", min: "1", max: "10", value: rating, onChange: (e) => setRating(Number(e.target.value)) })] }), _jsx("button", { type: "submit", children: "Agregar Pel\u00EDcula" })] })), _jsx("div", { className: "movies-grid", children: movies.map((movie) => (_jsxs("div", { className: "movie-card", children: [_jsx("h3", { children: movie.title }), _jsx("p", { children: movie.description }), _jsxs("p", { children: [_jsx("strong", { children: "Fecha:" }), " ", new Date(movie.releaseDate).toLocaleDateString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Calificaci\u00F3n:" }), " \u2B50 ", movie.rating, "/10"] }), user && (_jsx("button", { onClick: () => handleDeleteMovie(movie._id), className: "delete-btn", children: " Eliminar " }))] }, movie._id))) })] }));
};
export default MovieList;
