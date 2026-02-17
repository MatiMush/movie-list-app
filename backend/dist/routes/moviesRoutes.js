"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moviesController_1 = require("../controllers/moviesController");
const router = express_1.default.Router();
router.get('/search', moviesController_1.searchMovies);
router.get('/popular/movies', moviesController_1.getPopularMovies);
router.get('/popular/series', moviesController_1.getPopularSeries);
exports.default = router;
