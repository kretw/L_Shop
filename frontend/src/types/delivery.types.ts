export type PaymentMethod = 'card' | 'cash' | 'crypto';

export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// ← Добавляем интерфейс для элемента снапшота
export interface IDeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

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

export interface ICreateDeliveryBody {
  address: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
}