import { Request, Response } from 'express';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your_tmdb_api_key';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
      },
    });

    const results = response.data.results
      .filter(
        (item: any) =>
          item.media_type === 'movie' || item.media_type === 'tv'
      )
      .map((item: any) => ({
        tmdbId: item.id,
        title:
          item.media_type === 'movie' ? item.title : item.name,
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPopularMovies = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });

    const results = response.data.results.map((item: any) => ({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPopularSeries = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });

    const results = response.data.results.map((item: any) => ({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
