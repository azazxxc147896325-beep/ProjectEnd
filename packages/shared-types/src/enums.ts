export enum Role {
  STUDENT = 'student',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COOKING = 'cooking',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CancelledBy {
  USER = 'user',
  VENDOR = 'vendor',
  SYSTEM = 'system',
}
