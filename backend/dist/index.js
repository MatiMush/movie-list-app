"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = require("cors");
const authRoutes_1 = require("./routes/authRoutes");
const listRoutes_1 = require("./routes/listRoutes");
const moviesRoutes_1 = require("./routes/moviesRoutes");
const database_1 = require("./config/database");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
(0, database_1.default)();
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/lists', listRoutes_1.default);
app.use('/api/movies', moviesRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
