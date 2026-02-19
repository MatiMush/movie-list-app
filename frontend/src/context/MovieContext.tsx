import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Genre {
  id: number;
  name: string;
}

interface MovieContextType {
  genres: Genre[];
  loading: boolean;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/genres');
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovieContext.Provider value={{ genres, loading }}>
      {children}
    </MovieContext.Provider>
  );
};