import { Request, Response, NextFunction } from 'express';
import { readData } from '../utils/fileStorage';
import { IUser } from '../types/user.types';

// Расширяем тип Request чтобы добавить поле user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Читаем куку session_id (httpOnly — недоступна через document.cookie)
  const sessionId = req.cookies['session_id'] as string | undefined;

  if (!sessionId) {
    res.status(401).json({ error: 'Unauthorized: no session' });
    return;
  }

  // Ищем пользователя по session_id (session_id === userId в нашей реализации)
  const users = readData<IUser>('users.json');
  const user = users.find((u) => u.id === sessionId);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: invalid session' });
    return;
  }

  // Прокидываем userId дальше в контроллер
  req.userId = user.id;
  next();
}