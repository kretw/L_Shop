import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authMiddleware } from '../middleware/authMiddleware';

export const cartRoutes = Router();

// Все роуты корзины требуют авторизации
cartRoutes.use(authMiddleware);

cartRoutes.get('/', getCart);
cartRoutes.post('/', addToCart);
cartRoutes.patch('/:productId', updateCartItem);
cartRoutes.delete('/:productId', removeFromCart);
cartRoutes.delete('/', clearCart);