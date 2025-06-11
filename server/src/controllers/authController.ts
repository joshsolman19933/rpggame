import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // A jelszó hash-elését a Mongoose pre-save hook fogja elvégezni
    const user = await User.create({
      username,
      email,
      password, // A jelszó sima szövegként kerül elmentésre, a pre-save hook fogja hash-elni
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  console.log('Login attempt for email:', email);

  try {
    // Explicitly select the password field which is normally excluded
    const user = await User.findOne({ email }).select('+password');
    
    console.log('User found in DB:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User password exists:', !!user.password);
      console.log('User password length:', user.password ? user.password.length : 0);
      
      const isMatch = await user.matchPassword(password);
      console.log('Password match:', isMatch);
      
      if (isMatch) {
        const userObj = user.toObject();
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id.toString()),
        });
        return;
      }
    }
    
    console.log('Login failed - invalid email or password');
    res.status(401).json({ message: 'Invalid email or password' });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
