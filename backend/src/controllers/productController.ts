import { Request, Response } from 'express';
import { IProduct, IProductQuery, ProductCategory } from '../types/product.types';
import { readData } from '../utils/fileStorage';

// ───── GET /api/products ─────
// Поддерживает query: search, category, available, sortByPrice, minPrice, maxPrice
export function getProducts(req: Request, res: Response): void {
  const {
    search,
    category,
    available,
    sortByPrice,
    minPrice,
    maxPrice,
  } = req.query as IProductQuery;

  let products = readData<IProduct>('products.json');

  // ── Поиск по имени или описанию ──
  if (search) {
    const lowerSearch = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
    );
  }

  // ── Фильтр по категории ──
  if (category) {
    products = products.filter((p) => p.category === category);
  }

  // ── Фильтр по доступности ──
  if (available !== undefined) {
    const isAvailable = available === 'true';
    products = products.filter((p) => p.available === isAvailable);
  }

  // ── Фильтр по минимальной цене ──
  if (minPrice !== undefined) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      products = products.filter((p) => p.price >= min);
    }
  }

  // ── Фильтр по максимальной цене ──
  if (maxPrice !== undefined) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      products = products.filter((p) => p.price <= max);
    }
  }

  // ── Сортировка по цене ──
  if (sortByPrice === 'asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortByPrice === 'desc') {
    products.sort((a, b) => b.price - a.price);
  }

  res.status(200).json({ products });
}

// ───── GET /api/products/:id ─────
export function getProductById(req: Request, res: Response): void {
  const { id } = req.params;
  const products = readData<IProduct>('products.json');

  const product = products.find((p) => p.id === id);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.status(200).json({ product });
}

// ───── GET /api/products/categories ─────
export function getCategories(_req: Request, res: Response): void {
  const categories: ProductCategory[] = [
    'engine',
    'fuel_system',
    'navigation',
    'structure',
    'electronics',
    'life_support',
  ];
  res.status(200).json({ categories });
}