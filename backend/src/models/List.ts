import mongoose, { Schema } from 'mongoose';

// Movie Schema
const MovieSchema = new Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 10 }
});

const Movie = mongoose.model('Movie', MovieSchema);

// List Schema
const ListSchema = new Schema({
    name: { type: String, required: true },
    movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
    createdAt: { type: Date, default: Date.now }
});

const List = mongoose.model('List', ListSchema);

export { Movie, List };