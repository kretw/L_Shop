export type ProductCategory =
  | 'engine'
  | 'fuel_system'
  | 'navigation'
  | 'structure'
  | 'electronics'
  | 'life_support';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  stock: number;
  imageUrl: string;
  manufacturer: string;
  weightKg: number;
  createdAt: string;
}

export interface IProductQuery {
  search?: string;
  category?: ProductCategory;
  available?: string;
  sortByPrice?: 'asc' | 'desc';
  minPrice?: string;
  maxPrice?: string;
}