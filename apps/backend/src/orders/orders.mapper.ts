import {
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  CancelledBy,
  Role,
} from '@campus-food/shared-types';

/**
 * Maps a Prisma Order entity (with relations) to a clean, type-safe shared domain Order interface.
 * Eliminates double-casting (e.g. `order as unknown as Order`).
 */
export function toDomainOrder(raw: any): Order {
  if (!raw) return raw;

  return {
    id: raw.id,
    studentId: raw.studentId,
    student: raw.student
      ? {
          id: raw.student.id,
          email: raw.student.email,
          fullName: raw.student.fullName,
          role: raw.student.role as Role,
          phone: raw.student.phone,
          createdAt: raw.student.createdAt,
        }
      : undefined,
    vendorId: raw.vendorId,
    vendor: raw.vendor
      ? {
          id: raw.vendor.id,
          ownerId: raw.vendor.ownerId,
          name: raw.vendor.name,
          description: raw.vendor.description,
          logoUrl: raw.vendor.logoUrl,
          promptpayId: raw.vendor.promptpayId,
          isOpen: raw.vendor.isOpen,
        }
      : undefined,
    orderType: raw.orderType as OrderType,
    status: raw.status as OrderStatus,
    paymentMethod: raw.paymentMethod as PaymentMethod,
    paymentStatus: raw.paymentStatus as PaymentStatus,
    paidAt: raw.paidAt,
    transactionId: raw.transactionId,
    promptpayQrPayload: raw.promptpayQrPayload,
    note: raw.note,
    totalPrice: Number(raw.totalPrice),
    queueNumber: raw.queueNumber,
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any): OrderItem => ({
          id: item.id,
          orderId: item.orderId,
          menuItemId: item.menuItemId,
          menuItem: item.menuItem
            ? {
                id: item.menuItem.id,
                vendorId: item.menuItem.vendorId,
                name: item.menuItem.name,
                description: item.menuItem.description,
                price: Number(item.menuItem.price),
                imageUrl: item.menuItem.imageUrl,
                category: item.menuItem.category,
                isDailySpecial: item.menuItem.isDailySpecial,
                isAvailable: item.menuItem.isAvailable,
                deletedAt: item.menuItem.deletedAt,
              }
            : undefined,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          options: item.options,
          subtotal: Number(item.subtotal),
        }))
      : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    readyAt: raw.readyAt,
    completedAt: raw.completedAt,
    cancelledBy: (raw.cancelledBy as CancelledBy) || null,
    cancelReason: raw.cancelReason || null,
  };
}

export function toDomainOrders(rawList: any[]): Order[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(toDomainOrder);
}
