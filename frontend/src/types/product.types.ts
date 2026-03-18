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

export interface IProductFilters {
  search: string;
  category: ProductCategory | '';
  available: boolean | null;
  sortByPrice: 'asc' | 'desc' | '';
  minPrice: number | null;
  maxPrice: number | null;
}