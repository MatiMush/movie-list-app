import React, { createContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/movies';
const API_BASE_URL = 'http://localhost:5000/api';

interface Genre {
    id: number;
    name: string;
}

interface MovieContextType {
    getAllMovies: () => Promise<any[]>;
    addMovie: (movie: any) => Promise<void>;
    deleteMovie: (id: string) => Promise<void>;
    updateMovie: (id: string, movie: any) => Promise<void>;
    genres: Genre[];
    loadingGenres: boolean;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState<boolean>(true);

    // Fetch genres from backend on mount
    useEffect(() => {
        let mounted = true;
        
        async function loadGenres() {
            try {
                const response = await axios.get(`${API_BASE_URL}/genres`);
                if (!mounted) return;
                
                // Deduplicate genres by id
                const genresData = response.data;
                const genreMap = new Map<number, Genre>();
                for (const genre of genresData) {
                    if (!genreMap.has(genre.id)) {
                        genreMap.set(genre.id, genre);
                    }
                }
                setGenres(Array.from(genreMap.values()));
                setLoadingGenres(false);
            } catch (error) {
                console.error('Error fetching genres:', error);
                setLoadingGenres(false);
            }
        }
        
        loadGenres();
        
        return () => {
            mounted = false;
        };
    }, []);

    const getAllMovies = async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    };

    const addMovie = async (movie: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_URL, movie, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Error adding movie:', error);
            throw error;
        }
    };

    const deleteMovie = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Error deleting movie:', error);
            throw error;
        }
    };

    const updateMovie = async (id: string, movie: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/${id}`, movie, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Error updating movie:', error);
            throw error;
        }
    };

    return (
        <MovieContext.Provider value={{ getAllMovies, addMovie, deleteMovie, updateMovie, genres, loadingGenres }}>
            {children}
        </MovieContext.Provider>
    );
};