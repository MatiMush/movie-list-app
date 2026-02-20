import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        friends: [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('friends', 'name email');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        friends: user.friends,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).populate('friends', 'name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        friends: user.friends,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).populate('friends', 'name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ friends: user.friends || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addFriendByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userId = (req as any).userId;

    if (!email) {
      return res.status(400).json({ message: 'Friend email is required' });
    }

    const me = await User.findById(userId);
    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friend = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!friend) {
      return res.status(404).json({ message: 'User with that email was not found' });
    }

    if (friend._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot add yourself' });
    }

    const alreadyFriends = me.friends.some((id: any) => id.toString() === friend._id.toString());
    if (alreadyFriends) {
      return res.status(400).json({ message: 'This user is already your friend' });
    }

    me.friends.push(friend._id as any);
    await me.save();

    const refreshed = await User.findById(userId).populate('friends', 'name email');

    res.status(200).json({
      message: 'Friend added successfully',
      friends: refreshed?.friends || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};