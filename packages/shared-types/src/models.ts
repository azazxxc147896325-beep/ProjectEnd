import { Role, OrderStatus, OrderType, CancelledBy, PaymentMethod, PaymentStatus } from './enums';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  vendor?: Vendor | null;
  orders?: Order[];
}

export interface Vendor {
  id: string;
  ownerId: string;
  owner?: User;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  promptpayId?: string | null;
  isOpen: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  menuItems?: MenuItem[];
  orders?: Order[];
}

export interface MenuItem {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
  isDailySpecial: boolean;
  isAvailable: boolean;
  deletedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  orderItems?: OrderItem[];
}

export interface OrderItemOption {
  name: string;
  choice: string;
  additionalPrice?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  unitPrice: number;
  options?: OrderItemOption[] | Record<string, unknown> | null;
  subtotal: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Order {
  id: string;
  studentId: string;
  student?: User;
  vendorId: string;
  vendor?: Vendor;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: string | Date | null;
  transactionId?: string | null;
  promptpayQrPayload?: string | null;
  note?: string | null;
  totalPrice: number;
  queueNumber: number;
  items: OrderItem[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  readyAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledBy?: CancelledBy | null;
  cancelReason?: string | null;
}
