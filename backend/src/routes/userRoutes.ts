import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRoutes = Router();

userRoutes.post('/register', register);
userRoutes.post('/login', login);
userRoutes.post('/logout', logout);
userRoutes.get('/me', authMiddleware, getMe);