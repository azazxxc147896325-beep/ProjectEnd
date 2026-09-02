import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryCacheService } from '../common/cache/memory-cache.service';
import { Role } from '@campus-food/shared-types';

describe('VendorsService', () => {
  let service: VendorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    vendor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        MemoryCacheService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return list of vendors and cache the result', async () => {
      const mockVendors = [{ id: 'v1', name: 'Noodle Shop', isOpen: true }];
      mockPrismaService.vendor.findMany.mockResolvedValue(mockVendors);

      const res1 = await service.findAll(false);
      expect(res1).toEqual(mockVendors);
      expect(mockPrismaService.vendor.findMany).toHaveBeenCalledTimes(1);

      // Second call should return from cache
      const res2 = await service.findAll(false);
      expect(res2).toEqual(mockVendors);
      expect(mockPrismaService.vendor.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single vendor with menus', async () => {
      const mockVendor = { id: 'v1', name: 'Noodle Shop', menuItems: [] };
      mockPrismaService.vendor.findUnique.mockResolvedValue(mockVendor);

      const res = await service.findOne('v1');
      expect(res).toEqual(mockVendor);
    });

    it('should throw NotFoundException if vendor does not exist', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new vendor profile', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue(null);
      mockPrismaService.vendor.create.mockResolvedValue({ id: 'v1', name: 'Steak House', ownerId: 'u1' });

      const res = await service.create('u1', { name: 'Steak House', promptpayId: '0812345678' });
      expect(res.name).toBe('Steak House');
    });

    it('should throw ConflictException if user already has a vendor store', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'existing-store' });

      await expect(service.create('u1', { name: 'Duplicate Store' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update vendor for owner', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'v1', ownerId: 'u1' });
      mockPrismaService.vendor.update.mockResolvedValue({ id: 'v1', name: 'Updated Store' });

      const res = await service.update('v1', 'u1', Role.VENDOR, { name: 'Updated Store' });
      expect(res.name).toBe('Updated Store');
    });

    it('should throw ForbiddenException if other user attempts to update', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'v1', ownerId: 'u1' });

      await expect(
        service.update('v1', 'intruder-user', Role.VENDOR, { name: 'Hacked Store' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleOpen', () => {
    it('should toggle store open/close status', async () => {
      mockPrismaService.vendor.findUnique.mockResolvedValue({ id: 'v1', ownerId: 'u1' });
      mockPrismaService.vendor.update.mockResolvedValue({ id: 'v1', isOpen: false });

      const res = await service.toggleOpen('v1', 'u1', Role.VENDOR, false);
      expect(res.isOpen).toBe(false);
    });
  });
});
