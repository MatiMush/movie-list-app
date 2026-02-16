import express from 'express';
import {
  searchMovies,
  getPopularMovies,
  getPopularSeries,
} from '../controllers/moviesController';

const router = express.Router();

router.get('/search', searchMovies);
router.get('/popular/movies', getPopularMovies);
router.get('/popular/series', getPopularSeries);

export default router;