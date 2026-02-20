import React from 'react';
import '../styles/MovieList.css';
import { useAuth } from '../context/AuthContext';

const MovieList: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="movie-list-container">
      <h1>🎬 Mi Lista de Películas</h1>
      <p>
        Esta vista quedó en modo legado. Usa la pantalla principal para explorar y la sección
        "Mi página" para gestionar Favoritos, Interés y listas personalizadas.
      </p>
      {!user && <p>Inicia sesión para crear y administrar listas.</p>}
    </div>
  );
};

export default MovieList;