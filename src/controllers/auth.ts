import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/users';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// User registration
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUserByEmail = await userModel.fetchUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    const existingUserByUsername = await userModel.fetchUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        error: 'User already exists', 
        message: 'A user with this username already exists'
      });
    }

    // Create user
    const newUser = await userModel.insertUser({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.fullName,
        bio: newUser.bio,
        profileImageUrl: newUser.profileImageUrl,
        createdAt: newUser.createdAt
      },
      token
    });

  } catch (err) {
    next(err);
  }
};

// User login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user by email (including password for validation)
    const user = await userModel.fetchUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isPasswordValid = await userModel.validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Update last login time
    await userModel.updateUserById(user._id.toString(), { 
      lastLoginAt: new Date() 
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        lastLoginAt: new Date(),
        createdAt: user.createdAt
      },
      token
    });

  } catch (err) {
    next(err);
  }
};

// User logout (client-side token removal, server-side validation)
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a JWT system, logout is primarily handled client-side by removing the token
    // We can optionally implement a blacklist for tokens, but for now, we'll just confirm logout
    res.status(200).json({
      message: 'Logout successful',
      instruction: 'Please remove the JWT token from your client'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};

// Refresh JWT token
export const refreshToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Fetch current user data
    const user = await userModel.fetchUserById(userId);
    
    // Generate new JWT token
    const newToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    next(err);
  }
};

// Get current authenticated user profile
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Fetch user data
    const user = await userModel.fetchUserById(userId);
    
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        exhibitionsCount: user.exhibitions?.length || 0,
        favoritesCount: user.favoriteArtworks?.length || 0,
        preferences: user.preferences
      }
    });

  } catch (err) {
    next(err);
  }
};