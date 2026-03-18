export interface ICartItem {
  productId: string;
  quantity: number;
  priceAtAdd: number;
}

export interface ICart {
  id: string;
  userId: string;
  items: ICartItem[];
  updatedAt: string;
}

// Для отображения в корзине — с данными о товаре
export interface ICartItemEnriched {
  productId: string;
  productName: string;
  quantity: number;
  priceAtAdd: number;
  available: boolean;
  imageUrl: string;
}