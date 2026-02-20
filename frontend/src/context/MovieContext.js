import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const MovieContext = createContext(undefined);
export const MovieProvider = ({ children }) => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchGenres();
    }, []);
    const fetchGenres = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/genres');
            setGenres(response.data.genres || []);
        }
        catch (error) {
            console.error('Error fetching genres:', error);
            setGenres([]);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(MovieContext.Provider, { value: { genres, loading }, children: children }));
};
