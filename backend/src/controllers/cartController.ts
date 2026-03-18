import { Request, Response } from 'express';
import { ICart, ICartItem, IAddToCartBody, IUpdateCartItemBody } from '../types/cart.types';
import { IProduct } from '../types/product.types';
import { readData, writeData } from '../utils/fileStorage';
import { IUser } from '../types/user.types';

// ───── GET /api/cart ─────
export function getCart(req: Request, res: Response): void {
  const userId = req.userId as string;

  const users = readData<IUser>('users.json');
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const carts = readData<ICart>('carts.json');
  const cart = carts.find((c) => c.id === user.cartId);

  if (!cart) {
    res.status(404).json({ error: 'Cart not found' });
    return;
  }

  // Обогащаем корзину данными о товарах
  const products = readData<IProduct>('products.json');

  const enrichedItems = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      productName: product?.name ?? 'Unknown product',
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      available: product?.available ?? false,
      imageUrl: product?.imageUrl ?? '',
    };
  });

  res.status(200).json({ cart: { ...cart, items: enrichedItems } });
}

// ───── POST /api/cart ─────
export function addToCart(req: Request, res: Response): void {
  const userId = req.userId as string;
  const { productId, quantity } = req.body as IAddToCartBody;

  if (!productId || !quantity || quantity < 1) {
    res.status(400).json({ error: 'productId and quantity are required' });
    return;
  }

  const products = readData<IProduct>('products.json');
  const product = products.find((p) => p.id === productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  if (!product.available || product.stock < quantity) {
    res.status(400).json({ error: 'Product not available in requested quantity' });
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

  // Если товар уже в корзине — увеличиваем количество
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  );

  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    const newItem: ICartItem = {
      productId,
      quantity,
      priceAtAdd: product.price,
    };
    cart.items.push(newItem);
  }

  cart.updatedAt = new Date().toISOString();
  carts[cartIndex] = cart;

  writeData<ICart>('carts.json', carts);

  res.status(200).json({ message: 'Added to cart', cart });
}

// ───── PATCH /api/cart/:productId ─────
export function updateCartItem(req: Request, res: Response): void {
  const userId = req.userId as string;
  const { productId } = req.params;
  const { quantity } = req.body as IUpdateCartItemBody;

  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Quantity must be at least 1' });
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
  const itemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  );

  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found in cart' });
    return;
  }

  cart.items[itemIndex].quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  carts[cartIndex] = cart;

  writeData<ICart>('carts.json', carts);

  res.status(200).json({ message: 'Cart updated', cart });
}

// ───── DELETE /api/cart/:productId ─────
export function removeFromCart(req: Request, res: Response): void {
  const userId = req.userId as string;
  const { productId } = req.params;

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
  cart.items = cart.items.filter((item) => item.productId !== productId);
  cart.updatedAt = new Date().toISOString();
  carts[cartIndex] = cart;

  writeData<ICart>('carts.json', carts);

  res.status(200).json({ message: 'Item removed from cart', cart });
}

// ───── DELETE /api/cart ─────
export function clearCart(req: Request, res: Response): void {
  const userId = req.userId as string;

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

  carts[cartIndex].items = [];
  carts[cartIndex].updatedAt = new Date().toISOString();

  writeData<ICart>('carts.json', carts);

  res.status(200).json({ message: 'Cart cleared' });
}