export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card' | 'cash' | 'crypto';

export interface IDelivery {
  id: string;
  userId: string;
  cartSnapshot: IDeliveryItem[];
  address: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  status: DeliveryStatus;
  createdAt: string;
}

export interface IDeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

export interface ICreateDeliveryBody {
  address: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
}