import { User, IUser } from './User';
import bcrypt from 'bcrypt';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const fetchUsers = async (): Promise<IUser[]> => {
  return await User.find({ isActive: true }).select('-password');
};

export const fetchUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found') as any;
    error.status = 404;
    throw error;
  }
  return user;
};

export const fetchUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email, isActive: true });
};

export const fetchUserByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username, isActive: true });
};

export const insertUser = async (userData: CreateUserData): Promise<IUser> => {
  const { password, ...otherData } = userData;
  
  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const user = new User({
    ...otherData,
    password: hashedPassword
  });
  
  return await user.save();
};

export const updateUserById = async (userId: string, updates: Partial<IUser>): Promise<IUser> => {
  // Remove sensitive fields from updates
  const { password, ...safeUpdates } = updates as any;
  
  const user = await User.findByIdAndUpdate(
    userId,
    { ...safeUpdates, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    const error = new Error('User not found') as any;
    error.status = 404;
    throw error;
  }
  
  return user;
};

export const removeUserById = async (userId: string): Promise<void> => {
  // Soft delete - set isActive to false
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );
  
  if (!user) {
    const error = new Error('User not found') as any;
    error.status = 404;
    throw error;
  }
};

export const validatePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};