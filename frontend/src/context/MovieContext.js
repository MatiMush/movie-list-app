import { jsx as _jsx } from "react/jsx-runtime";
import { createContext } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api/movies';
export const MovieContext = createContext(undefined);
export const MovieProvider = ({ children }) => {
    const getAllMovies = async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    };
    const addMovie = async (movie) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_URL, movie, { headers: { Authorization: `Bearer ${token}` } });
        }
        catch (error) {
            console.error('Error adding movie:', error);
            throw error;
        }
    };
    const deleteMovie = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
        catch (error) {
            console.error('Error deleting movie:', error);
            throw error;
        }
    };
    const updateMovie = async (id, movie) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/${id}`, movie, { headers: { Authorization: `Bearer ${token}` } });
        }
        catch (error) {
            console.error('Error updating movie:', error);
            throw error;
        }
    };
    return (_jsx(MovieContext.Provider, { value: { getAllMovies, addMovie, deleteMovie, updateMovie }, children: children }));
};
