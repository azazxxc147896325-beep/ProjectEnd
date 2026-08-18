import { Role, OrderStatus, OrderType, CancelledBy } from './enums';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  createdAt: string | Date;
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
  isOpen: boolean;
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
}

export interface Order {
  id: string;
  studentId: string;
  student?: User;
  vendorId: string;
  vendor?: Vendor;
  orderType: OrderType;
  status: OrderStatus;
  note?: string | null;
  totalPrice: number;
  queueNumber: number;
  items: OrderItem[];
  createdAt: string | Date;
  readyAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledBy?: CancelledBy | null;
  cancelReason?: string | null;
}

