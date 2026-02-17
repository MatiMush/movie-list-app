"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteList = exports.removeMovieFromList = exports.addMovieToList = exports.updateList = exports.getListById = exports.getMyLists = exports.createList = void 0;
const List_1 = require("../models/List");
const createList = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        if (!name) {
            return res.status(400).json({ message: 'List name is required' });
        }
        const list = new List_1.default({
            name,
            userId,
            movies: [],
        });
        await list.save();
        res.status(201).json({
            message: 'List created successfully',
            list,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createList = createList;
const getMyLists = async (req, res) => {
    try {
        const userId = req.userId;
        const lists = await List_1.default.find({ userId });
        res.status(200).json({
            lists,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMyLists = getMyLists;
const getListById = async (req, res) => {
    try {
        const { listId } = req.params;
        const list = await List_1.default.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        res.status(200).json({ list });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getListById = getListById;
const updateList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { name } = req.body;
        const userId = req.userId;
        let list = await List_1.default.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        list.name = name || list.name;
        await list.save();
        res.status(200).json({
            message: 'List updated successfully',
            list,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateList = updateList;
const addMovieToList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { movieId } = req.body;
        const userId = req.userId;
        let list = await List_1.default.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (!list.movies.includes(movieId)) {
            list.movies.push(movieId);
            await list.save();
        }
        res.status(200).json({
            message: 'Movie added to list',
            list,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addMovieToList = addMovieToList;
const removeMovieFromList = async (req, res) => {
    try {
        const { listId, movieId } = req.params;
        const userId = req.userId;
        let list = await List_1.default.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        list.movies = list.movies.filter((id) => id.toString() !== movieId);
        await list.save();
        res.status(200).json({
            message: 'Movie removed from list',
            list,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.removeMovieFromList = removeMovieFromList;
const deleteList = async (req, res) => {
    try {
        const { listId } = req.params;
        const userId = req.userId;
        const list = await List_1.default.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await List_1.default.findByIdAndDelete(listId);
        res.status(200).json({
            message: 'List deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteList = deleteList;
