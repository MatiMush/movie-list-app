"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularSeries = exports.getPopularMovies = exports.searchMovies = void 0;
const axios_1 = require("axios");
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your_tmdb_api_key';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const searchMovies = async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const response = await axios_1.default.get(`${TMDB_BASE_URL}/search/multi`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                page,
            },
        });
        const results = response.data.results
            .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item) => ({
            tmdbId: item.id,
            title: item.media_type === 'movie' ? item.title : item.name,
            year: item.media_type === 'movie'
                ? item.release_date?.split('-')[0]
                : item.first_air_date?.split('-')[0],
            poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : '',
            description: item.overview,
            rating: item.vote_average,
            type: item.media_type === 'movie' ? 'movie' : 'series',
        }));
        res.status(200).json({
            results,
            totalPages: response.data.total_pages,
            currentPage: response.data.page,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.searchMovies = searchMovies;
const getPopularMovies = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const response = await axios_1.default.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                page,
            },
        });
        const results = response.data.results.map((item) => ({
            tmdbId: item.id,
            title: item.title,
            year: item.release_date?.split('-')[0],
            poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : '',
            description: item.overview,
            rating: item.vote_average,
            type: 'movie',
        }));
        res.status(200).json({
            results,
            totalPages: response.data.total_pages,
            currentPage: response.data.page,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPopularMovies = getPopularMovies;
const getPopularSeries = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const response = await axios_1.default.get(`${TMDB_BASE_URL}/tv/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                page,
            },
        });
        const results = response.data.results.map((item) => ({
            tmdbId: item.id,
            title: item.name,
            year: item.first_air_date?.split('-')[0],
            poster: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : '',
            description: item.overview,
            rating: item.vote_average,
            type: 'series',
        }));
        res.status(200).json({
            results,
            totalPages: response.data.total_pages,
            currentPage: response.data.page,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPopularSeries = getPopularSeries;
