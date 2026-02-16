import { Request, Response } from 'express';
import List from '../models/List';

export const createList = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    if (!name) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const list = new List({
      name,
      userId,
      movies: [],
    });

    await list.save();

    res.status(201).json({
      message: 'List created successfully',
      list,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyLists = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const lists = await List.find({ userId });

    res.status(200).json({
      lists,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getListById = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(200).json({ list });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { name } = req.body;
    const userId = (req as any).userId;

    let list = await List.findById(listId);

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addMovieToList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { movieId } = req.body;
    const userId = (req as any).userId;

    let list = await List.findById(listId);

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const removeMovieFromList = async (req: Request, res: Response) => {
  try {
    const { listId, movieId } = req.params;
    const userId = (req as any).userId;

    let list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    list.movies = list.movies.filter((id: any) => id.toString() !== movieId);
    await list.save();

    res.status(200).json({
      message: 'Movie removed from list',
      list,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = (req as any).userId;

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await List.findByIdAndDelete(listId);

    res.status(200).json({
      message: 'List deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
