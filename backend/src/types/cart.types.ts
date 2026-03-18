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

export interface IAddToCartBody {
  productId: string;
  quantity: number;
}

export interface IUpdateCartItemBody {
  quantity: number;
}