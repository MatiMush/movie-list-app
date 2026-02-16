import React, { useState, useEffect, useContext } from 'react';
import '../styles/MovieList.css';
import { MovieContext } from '../context/MovieContext';
import { AuthContext } from '../context/AuthContext';

interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  rating: number;
}

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');

  const { getAllMovies, addMovie, deleteMovie } = useContext(MovieContext)!;
  const { user } = useContext(AuthContext)!;

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const data = await getAllMovies();
      setMovies(data);
    } catch (err: any) {
      setError('Error al cargar películas');
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMovie({ title, description, releaseDate, rating });
      setTitle('');
      setDescription('');
      setReleaseDate('');
      setRating(5);
      fetchMovies();
    } catch (err: any) {
      setError('Error al agregar película');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      await deleteMovie(id);
      fetchMovies();
    } catch (err: any) {
      setError('Error al eliminar película');
    }
  };

  return (
    <div className="movie-list-container">
      <h1>🎬 Mi Lista de Películas</h1>
      {error && <p className="error">{error}</p>}
      {user && (
        <form onSubmit={handleAddMovie} className="movie-form">
          <h2>Agregar Nueva Película</h2>
          <div className="form-group">
            <label>Título:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Fecha de Estreno:</label>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Calificación (1-10):</label>
            <input type="number" min="1" max="10" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <button type="submit">Agregar Película</button>
        </form>
      )}
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie._id} className="movie-card">
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <p><strong>Fecha:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
            <p><strong>Calificación:</strong> ⭐ {movie.rating}/10</p>
            {user && (
              <button onClick={() => handleDeleteMovie(movie._id)} className="delete-btn"> Eliminar </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;