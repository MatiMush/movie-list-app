import React, { createContext, useState, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/movies';

interface MovieContextType {
    getAllMovies: () => Promise<any[]>;
    addMovie: (movie: any) => Promise<void>;
    deleteMovie: (id: string) => Promise<void>;
    updateMovie: (id: string, movie: any) => Promise<void>;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        <MovieContext.Provider value={{ getAllMovies, addMovie, deleteMovie, updateMovie }}>
            {children}
        </MovieContext.Provider>
    );
};