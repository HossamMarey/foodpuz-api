import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, expiresIn: string = '15m'): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
};
