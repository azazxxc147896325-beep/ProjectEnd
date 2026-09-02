import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryCacheService } from '../common/cache/memory-cache.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Role } from '@campus-food/shared-types';

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private cache: MemoryCacheService,
  ) {}

  public clearCache() {
    this.cache.clear();
  }

  async findAll(onlyOpen?: boolean) {
    const cacheKey = `vendors:all:${onlyOpen ? 'open' : 'all'}`;
    const cached = this.cache.get<any[]>(cacheKey);
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

    this.cache.set(cacheKey, data);
    return data;
  }

  async findOne(id: string) {
    const cacheKey = `vendor:${id}`;
    const cached = this.cache.get<any>(cacheKey);
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

    this.cache.set(cacheKey, vendor);
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
        promptpayId: dto.promptpayId,
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
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.promptpayId !== undefined && { promptpayId: dto.promptpayId }),
        ...(dto.isOpen !== undefined && { isOpen: dto.isOpen }),
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
