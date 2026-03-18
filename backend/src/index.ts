import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import { userRoutes } from './routes/userRoutes';
import { productRoutes } from './routes/productRoutes';
import { cartRoutes } from './routes/cartRoutes';
import { deliveryRoutes } from './routes/deliveryRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';

const app: Application = express();
const PORT = 3000;

// ───── Middleware ─────
app.use(cors({
  origin: 'http://localhost:3001', 
  credentials: true,           
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// Статика — для картинок товаров
app.use('/images', express.static(path.resolve(__dirname, '../public/images')));

// ───── Роуты ─────
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/delivery', deliveryRoutes);

// ───── Обработка ошибок (всегда последний) ─────
app.use(errorMiddleware);

// ───── Запуск ─────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});