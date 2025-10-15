import { IUser } from './User';
interface CreateUserData {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export declare const fetchUsers: () => Promise<IUser[]>;
export declare const fetchUserById: (userId: string) => Promise<IUser>;
export declare const fetchUserByEmail: (email: string) => Promise<IUser | null>;
export declare const fetchUserByUsername: (username: string) => Promise<IUser | null>;
export declare const insertUser: (userData: CreateUserData) => Promise<IUser>;
export declare const updateUserById: (userId: string, updates: Partial<IUser>) => Promise<IUser>;
export declare const removeUserById: (userId: string) => Promise<void>;
export declare const validatePassword: (plainPassword: string, hashedPassword: string) => Promise<boolean>;
export {};
//# sourceMappingURL=users.d.ts.map