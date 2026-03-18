import { Request, Response } from 'express';
import {
  IUser,
  IRegisterBody,
  ILoginBody,
  IUserPublic,
} from '../types/user.types';
import { ICart } from '../types/cart.types';
import { readData, writeData, generateId } from '../utils/fileStorage';
import { hashPassword, comparePassword } from '../utils/hashPassword';

// ───── Вспомогательная функция ─────
function toPublicUser(user: IUser): IUserPublic {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    cartId: user.cartId,
  };
}

// ───── POST /api/users/register ─────
export function register(req: Request, res: Response): void {
  const { username, email, phone, password } = req.body as IRegisterBody;

  if (!username || !email || !phone || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const users = readData<IUser>('users.json');

  const exists = users.find(
    (u) => u.email === email || u.username === username
  );
  if (exists) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const newUser: IUser = {
    id: generateId(),
    username,
    email,
    phone,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    cartId: generateId(),
  };

  // Создаём пустую корзину для нового пользователя
  const carts = readData<ICart>('carts.json');
  const newCart: ICart = {
    id: newUser.cartId,
    userId: newUser.id,
    items: [],
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  carts.push(newCart);

  writeData<IUser>('users.json', users);
  writeData<ICart>('carts.json', carts);

  // Создаём httpOnly куку — НЕ видна через document.cookie
  // Время жизни — 10 минут (600000 мс)
  res.cookie('session_id', newUser.id, {
    httpOnly: true,       // недоступна через JS
    maxAge: 600000,       // 10 минут
    sameSite: 'lax',
  });

  res.status(201).json({
    message: 'Registered successfully',
    user: toPublicUser(newUser),
  });
}

// ───── POST /api/users/login ─────
export function login(req: Request, res: Response): void {
  const { login, password } = req.body as ILoginBody;

  if (!login || !password) {
    res.status(400).json({ error: 'Login and password are required' });
    return;
  }

  const users = readData<IUser>('users.json');

  // Ищем по email ИЛИ username ИЛИ phone
  const user = users.find(
    (u) =>
      u.email === login ||
      u.username === login ||
      u.phone === login
  );

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (!comparePassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  // Обновляем куку на 10 минут
  res.cookie('session_id', user.id, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: 'lax',
  });

  res.status(200).json({
    message: 'Logged in successfully',
    user: toPublicUser(user),
  });
}

// ───── POST /api/users/logout ─────
export function logout(_req: Request, res: Response): void {
  // Удаляем куку
  res.clearCookie('session_id');
  res.status(200).json({ message: 'Logged out successfully' });
}

// ───── GET /api/users/me ─────
export function getMe(req: Request, res: Response): void {
  const users = readData<IUser>('users.json');
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({ user: toPublicUser(user) });
}