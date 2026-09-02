import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryCacheService } from '../common/cache/memory-cache.service';
import { Role } from '@campus-food/shared-types';

describe('MenuService', () => {
  let service: MenuService;
  let prisma: PrismaService;
  let cache: MemoryCacheService;

  const mockPrismaService = {
    vendor: {
      findUnique: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        MemoryCacheService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get<MemoryCacheService>(MemoryCacheService);
    jest.clearAllMocks();
  });

  describe('findByVendor', () => {
    it('should return menu items from database and populate cache', async () => {
      const mockItems = [{ id: 'm1', name: 'Pad Thai', price: 50 }];
      mockPrismaService.menuItem.findMany.mockResolvedValue(mockItems);

      const res1 = await service.findByVendor('v1', false);
      expect(res1).toEqual(mockItems);
      expect(mockPrismaService.menuItem.findMany).toHaveBeenCalledTimes(1);

      // Second call should return from memory cache without hitting database
      const res2 = await service.findByVendor('v1', false);
      expect(res2).toEqual(mockItems);
      expect(mockPrismaService.menuItem.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single menu item', async () => {
      const mockItem = { id: 'm1', name: 'Pad Thai', vendor: { id: 'v1' } };
      mockPrismaService.menuItem.findFirst.mockResolvedValue(mockItem);

      const res = await service.findOne('m1');
      expect(res).toEqual(mockItem);
    });

    it('should throw NotFoundException if menu item does not exist', async () => {
      mockPrismaService.menuItem.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create menu item for vendor owner', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'v1', ownerId: 'user1' });
      mockPrismaService.menuItem.create.mockResolvedValue({ id: 'm1', name: 'Krapao', price: 60 });

      const res = await service.create('user1', Role.VENDOR, {
        name: 'Krapao',
        price: 60,
        category: 'Rice',
      });

      expect(res.name).toBe('Krapao');
      expect(mockPrismaService.menuItem.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user has no vendor store', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user2', Role.VENDOR, { name: 'Krapao', price: 60, category: 'Rice' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should allow vendor owner to update their menu item', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue({
        id: 'm1',
        vendorId: 'v1',
        vendor: { ownerId: 'user1' },
      });
      mockPrismaService.menuItem.update.mockResolvedValue({ id: 'm1', name: 'Updated Name' });

      const res = await service.update('m1', 'user1', Role.VENDOR, { name: 'Updated Name' });
      expect(res.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException if another user tries to update', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue({
        id: 'm1',
        vendorId: 'v1',
        vendor: { ownerId: 'user1' },
      });

      await expect(
        service.update('m1', 'intruder-user', Role.VENDOR, { name: 'Hacked Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete (Soft Delete)', () => {
    it('should soft delete menu item and set isAvailable to false', async () => {
      mockPrismaService.menuItem.findFirst.mockResolvedValue({
        id: 'm1',
        vendorId: 'v1',
        vendor: { ownerId: 'user1' },
      });
      mockPrismaService.menuItem.update.mockResolvedValue({
        id: 'm1',
        deletedAt: expect.any(Date),
        isAvailable: false,
      });

      const res = await service.delete('m1', 'user1', Role.VENDOR);
      expect(res.isAvailable).toBe(false);
      expect(mockPrismaService.menuItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isAvailable: false, deletedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
