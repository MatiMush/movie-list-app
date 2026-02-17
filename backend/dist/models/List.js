"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = exports.Movie = void 0;
const mongoose_1 = require("mongoose");
// Movie Schema
const MovieSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 10 }
});
const Movie = mongoose_1.default.model('Movie', MovieSchema);
exports.Movie = Movie;
// List Schema
const ListSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    movies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Movie' }],
    createdAt: { type: Date, default: Date.now }
});
const List = mongoose_1.default.model('List', ListSchema);
exports.List = List;
