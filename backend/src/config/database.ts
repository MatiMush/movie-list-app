import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/movie-list-app'; // Change this to your MongoDB URI

const connectDB = async () => {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
