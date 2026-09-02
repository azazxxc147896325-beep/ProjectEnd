import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role, WsEvents } from '@campus-food/shared-types';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: JwtService;
  let prisma: PrismaService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockPrismaService = {
    vendor: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
  };

  const createMockSocket = (overrides?: any) => {
    const socket: any = {
      id: 'mock-socket-id-123',
      handshake: {
        auth: {},
        headers: {},
      },
      data: {},
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      ...overrides,
    };
    return socket;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as any;
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate client if valid JWT token is provided in auth object', async () => {
      const mockUser = {
        sub: 'user-1',
        email: 'somjai@campus.ac.th',
        role: Role.VENDOR,
        vendorId: 'vendor-1',
      };
      mockJwtService.verify.mockReturnValue(mockUser);

      const client = createMockSocket({
        handshake: { auth: { token: 'valid-token' } },
      });

      await gateway.handleConnection(client);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(client.data.user).toEqual(mockUser);
    });

    it('should handle anonymous connection when no token is provided', async () => {
      const client = createMockSocket();

      await gateway.handleConnection(client);

      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(client.data.user).toBeUndefined();
    });

    it('should set client.data.user to null if token verification fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const client = createMockSocket({
        handshake: { auth: { token: 'expired-token' } },
      });

      await gateway.handleConnection(client);

      expect(client.data.user).toBeNull();
    });
  });

  describe('handleJoinVendorRoom', () => {
    it('should reject unauthenticated client from joining vendor room', async () => {
      const client = createMockSocket({ data: {} });

      const res = await gateway.handleJoinVendorRoom(client, { vendorId: 'vendor-1' });

      expect(res.event).toBe('error');
      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('Authentication required'),
      }));
    });

    it('should allow vendor owner to join their own vendor room', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'user-owner-1',
            email: 'vendor@campus.ac.th',
            role: Role.VENDOR,
            vendorId: 'vendor-1',
          },
        },
      });

      const res = await gateway.handleJoinVendorRoom(client, { vendorId: 'vendor-1' });

      expect(res.event).toBe('joined');
      expect(res.room).toBe('vendor_vendor-1');
      expect(client.join).toHaveBeenCalledWith('vendor_vendor-1');
    });

    it('should allow ADMIN to join any vendor room', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'admin-1',
            email: 'admin@campus.ac.th',
            role: Role.ADMIN,
          },
        },
      });

      const res = await gateway.handleJoinVendorRoom(client, { vendorId: 'vendor-99' });

      expect(res.event).toBe('joined');
      expect(client.join).toHaveBeenCalledWith('vendor_vendor-99');
    });

    it('should reject student or other vendor from joining unauthorized vendor room', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'student-1',
            email: 'student@campus.ac.th',
            role: Role.STUDENT,
          },
        },
      });
      mockPrismaService.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        ownerId: 'different-owner-id',
      });

      const res = await gateway.handleJoinVendorRoom(client, { vendorId: 'vendor-1' });

      expect(res.event).toBe('error');
      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('Forbidden'),
      }));
    });
  });

  describe('handleJoinOrderRoom', () => {
    it('should allow student who placed the order to join the order room', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'student-1',
            email: 'student@campus.ac.th',
            role: Role.STUDENT,
          },
        },
      });
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        vendorId: 'vendor-1',
      });

      const res = await gateway.handleJoinOrderRoom(client, { orderId: 'order-1' });

      expect(res.event).toBe('joined');
      expect(res.room).toBe('order_order-1');
      expect(client.join).toHaveBeenCalledWith('order_order-1');
    });

    it('should allow the preparing vendor to join the order room', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'vendor-user-1',
            email: 'vendor@campus.ac.th',
            role: Role.VENDOR,
            vendorId: 'vendor-1',
          },
        },
      });
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-99',
        vendorId: 'vendor-1',
      });

      const res = await gateway.handleJoinOrderRoom(client, { orderId: 'order-1' });

      expect(res.event).toBe('joined');
      expect(client.join).toHaveBeenCalledWith('order_order-1');
    });

    it('should reject another student from eavesdropping on an order', async () => {
      const client = createMockSocket({
        data: {
          user: {
            sub: 'intruder-student-2',
            email: 'intruder@campus.ac.th',
            role: Role.STUDENT,
          },
        },
      });
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        studentId: 'student-1',
        vendorId: 'vendor-1',
      });

      const res = await gateway.handleJoinOrderRoom(client, { orderId: 'order-1' });

      expect(res.event).toBe('error');
      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('Forbidden'),
      }));
    });
  });
});
