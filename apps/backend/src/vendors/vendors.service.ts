import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Role } from '@campus-food/shared-types';

@Injectable()
export class VendorsService {
  // In-memory cache for ultra-fast response times (1-2ms)
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 15000; // 15 seconds cache

  constructor(private prisma: PrismaService) {}

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL_MS });
  }

  public clearCache() {
    this.cache.clear();
  }

  async findAll(onlyOpen?: boolean) {
    const cacheKey = `vendors:all:${onlyOpen ? 'open' : 'all'}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.vendor.findMany({
      where: onlyOpen ? { isOpen: true } : {},
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    this.setCache(cacheKey, data);
    return data;
  }

  async findOne(id: string) {
    const cacheKey = `vendor:${id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true, deletedAt: null },
          orderBy: [{ isDailySpecial: 'desc' }, { category: 'asc' }],
        },
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    this.setCache(cacheKey, vendor);
    return vendor;
  }

  async findByOwner(ownerId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { ownerId },
      include: {
        menuItems: {
          where: { deletedAt: null },
          orderBy: [{ isDailySpecial: 'desc' }, { category: 'asc' }],
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`No vendor profile found for this user`);
    }

    return vendor;
  }

  async create(ownerId: string, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({
      where: { ownerId },
    });

    if (existing) {
      throw new ConflictException('This user already owns a vendor store');
    }

    this.clearCache();
    return this.prisma.vendor.create({
      data: {
        ownerId,
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        isOpen: dto.isOpen ?? true,
      },
    });
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    if (vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not allowed to update this vendor');
    }

    this.clearCache();
    return this.prisma.vendor.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        isOpen: dto.isOpen,
      },
    });
  }

  async toggleOpen(id: string, userId: string, userRole: Role, isOpen: boolean) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    if (vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not allowed to toggle store status');
    }

    this.clearCache();
    return this.prisma.vendor.update({
      where: { id },
      data: { isOpen },
    });
  }
}
