"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.removeUserById = exports.updateUserById = exports.insertUser = exports.fetchUserByUsername = exports.fetchUserByEmail = exports.fetchUserById = exports.fetchUsers = void 0;
const User_1 = require("./User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const fetchUsers = async () => {
    return await User_1.User.find({ isActive: true }).select('-password');
};
exports.fetchUsers = fetchUsers;
const fetchUserById = async (userId) => {
    const user = await User_1.User.findById(userId).select('-password');
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return user;
};
exports.fetchUserById = fetchUserById;
const fetchUserByEmail = async (email) => {
    return await User_1.User.findOne({ email, isActive: true });
};
exports.fetchUserByEmail = fetchUserByEmail;
const fetchUserByUsername = async (username) => {
    return await User_1.User.findOne({ username, isActive: true });
};
exports.fetchUserByUsername = fetchUserByUsername;
const insertUser = async (userData) => {
    const { password, ...otherData } = userData;
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    const user = new User_1.User({
        ...otherData,
        password: hashedPassword
    });
    console.log('Attempting to save new user:', user);
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser);
    return savedUser;
};
exports.insertUser = insertUser;
const updateUserById = async (userId, updates) => {
    // Remove sensitive fields from updates
    const { password, ...safeUpdates } = updates;
    const user = await User_1.User.findByIdAndUpdate(userId, { ...safeUpdates, updatedAt: new Date() }, { new: true, runValidators: true }).select('-password');
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return user;
};
exports.updateUserById = updateUserById;
const removeUserById = async (userId) => {
    // Soft delete - set isActive to false
    const user = await User_1.User.findByIdAndUpdate(userId, { isActive: false, updatedAt: new Date() }, { new: true });
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
};
exports.removeUserById = removeUserById;
const validatePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt_1.default.compare(plainPassword, hashedPassword);
};
exports.validatePassword = validatePassword;
//# sourceMappingURL=users.js.map