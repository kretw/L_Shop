import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
} from '../controllers/productController';

export const productRoutes = Router();

// Важно: /categories должен быть ДО /:id
productRoutes.get('/categories', getCategories);
productRoutes.get('/', getProducts);
productRoutes.get('/:id', getProductById);