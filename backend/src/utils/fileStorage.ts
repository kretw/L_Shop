import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../data');

// Читает JSON файл и возвращает типизированный массив
export function readData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);

  // Если файл не существует — возвращаем пустой массив
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');

  // Если файл пустой — возвращаем пустой массив
  if (!raw.trim()) {
    return [];
  }

  return JSON.parse(raw) as T[];
}

// Записывает массив данных в JSON файл
export function writeData<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Генерирует уникальный ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}