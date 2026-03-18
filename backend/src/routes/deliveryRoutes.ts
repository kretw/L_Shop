import { Router } from 'express';
import {
  createDelivery,
  getMyDeliveries,
  getDeliveryById,
} from '../controllers/deliveryController';
import { authMiddleware } from '../middleware/authMiddleware';

export const deliveryRoutes = Router();

// Все роуты доставки требуют авторизации
deliveryRoutes.use(authMiddleware);

deliveryRoutes.post('/', createDelivery);
deliveryRoutes.get('/', getMyDeliveries);
deliveryRoutes.get('/:id', getDeliveryById);