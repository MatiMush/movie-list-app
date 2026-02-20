import { Request, Response } from 'express';
import List from '../models/List';
import User from '../models/User';

const DEFAULT_LISTS = ['Favoritos', 'Interés'];

const ensureDefaultLists = async (userId: string) => {
  for (const listName of DEFAULT_LISTS) {
    const exists = await List.findOne({ userId, name: listName });
    if (!exists) {
      await List.create({ userId, name: listName, items: [], sharedWith: [] });
    }
  }
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    if (!name) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const existing = await List.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A list with that name already exists' });
    }

    const list = new List({
      name: name.trim(),
      userId,
      items: [],
      sharedWith: [],
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
    await ensureDefaultLists(userId);
    const lists = await List.find({ userId }).sort({ createdAt: -1 });

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
    const userId = (req as any).userId;
    const list = await List.findOne({ _id: listId, userId });

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

    if (DEFAULT_LISTS.includes(list.name)) {
      return res.status(400).json({ message: 'Default lists cannot be renamed' });
    }

    const nextName = name?.trim();
    if (nextName && nextName !== list.name) {
      const duplicate = await List.findOne({ userId, name: nextName });
      if (duplicate) {
        return res.status(400).json({ message: 'A list with that name already exists' });
      }
      list.name = nextName;
    }
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
    const { movie } = req.body;
    const userId = (req as any).userId;

    if (!movie || !movie.tmdbId || !movie.title) {
      return res.status(400).json({ message: 'Movie payload is required' });
    }

    let list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const exists = list.items.some((item: any) => item.tmdbId === Number(movie.tmdbId));

    if (!exists) {
      list.items.push({
        tmdbId: Number(movie.tmdbId),
        title: movie.title,
        poster: movie.poster || '',
        year: movie.year || '',
        genre: movie.genre || '',
        mediaType: movie.mediaType || 'movie',
        addedAt: new Date(),
      });
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

    list.items = list.items.filter((item: any) => item.tmdbId.toString() !== movieId);
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

    if (DEFAULT_LISTS.includes(list.name)) {
      return res.status(400).json({ message: 'Default lists cannot be deleted' });
    }

    await List.findByIdAndDelete(listId);

    res.status(200).json({
      message: 'List deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const shareListWithFriend = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { friendId } = req.body;
    const userId = (req as any).userId;

    if (!friendId) {
      return res.status(400).json({ message: 'friendId is required' });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const me = await User.findById(userId);
    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFriend = me.friends.some((id: any) => id.toString() === String(friendId));
    if (!isFriend) {
      return res.status(400).json({ message: 'You can only share lists with your friends' });
    }

    const alreadyShared = list.sharedWith.some((id: any) => id.toString() === String(friendId));
    if (!alreadyShared) {
      list.sharedWith.push(friendId);
      await list.save();
    }

    res.status(200).json({ message: 'List shared successfully', list });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getListsSharedWithMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const lists = await List.find({ sharedWith: userId })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ lists });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
