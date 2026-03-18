import { Request, Response } from 'express';
import {
  IDelivery,
  IDeliveryItem,
  ICreateDeliveryBody,
} from '../types/delivery.types';
import { ICart } from '../types/cart.types';
import { IProduct } from '../types/product.types';
import { IUser } from '../types/user.types';
import { readData, writeData, generateId } from '../utils/fileStorage';

// ───── POST /api/delivery ─────
export function createDelivery(req: Request, res: Response): void {
  const userId = req.userId as string;
  const { address, phone, email, paymentMethod } =
    req.body as ICreateDeliveryBody;

  if (!address || !phone || !email || !paymentMethod) {
    res.status(400).json({ error: 'All delivery fields are required' });
    return;
  }

  const users = readData<IUser>('users.json');
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const carts = readData<ICart>('carts.json');
  const cartIndex = carts.findIndex((c) => c.id === user.cartId);

  if (cartIndex === -1) {
    res.status(404).json({ error: 'Cart not found' });
    return;
  }

  const cart = carts[cartIndex];

  if (cart.items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  // Получаем данные о товарах для снапшота
  const products = readData<IProduct>('products.json');

  const cartSnapshot: IDeliveryItem[] = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      productName: product?.name ?? 'Unknown product',
      quantity: item.quantity,
      priceAtOrder: item.priceAtAdd,
    };
  });

  // Считаем итоговую сумму
  const totalPrice = cartSnapshot.reduce(
    (sum, item) => sum + item.priceAtOrder * item.quantity,
    0
  );

  // Создаём доставку
  const newDelivery: IDelivery = {
    id: generateId(),
    userId,
    cartSnapshot,
    address,
    phone,
    email,
    paymentMethod,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const deliveries = readData<IDelivery>('deliveries.json');
  deliveries.push(newDelivery);
  writeData<IDelivery>('deliveries.json', deliveries);

  // Очищаем корзину после успешного оформления
  carts[cartIndex].items = [];
  carts[cartIndex].updatedAt = new Date().toISOString();
  writeData<ICart>('carts.json', carts);

  res.status(201).json({
    message: 'Delivery created successfully',
    delivery: newDelivery,
  });
}

// ───── GET /api/delivery ─────
export function getMyDeliveries(req: Request, res: Response): void {
  const userId = req.userId as string;

  const deliveries = readData<IDelivery>('deliveries.json');
  const myDeliveries = deliveries.filter((d) => d.userId === userId);

  res.status(200).json({ deliveries: myDeliveries });
}

// ───── GET /api/delivery/:id ─────
export function getDeliveryById(req: Request, res: Response): void {
  const userId = req.userId as string;
  const { id } = req.params;

  const deliveries = readData<IDelivery>('deliveries.json');
  const delivery = deliveries.find(
    (d) => d.id === id && d.userId === userId
  );

  if (!delivery) {
    res.status(404).json({ error: 'Delivery not found' });
    return;
  }

  res.status(200).json({ delivery });
}