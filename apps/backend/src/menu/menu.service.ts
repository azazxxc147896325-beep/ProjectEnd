import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryCacheService } from '../common/cache/memory-cache.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Role } from '@campus-food/shared-types';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private cache: MemoryCacheService,
  ) {}

  public clearCache(vendorId?: string) {
    if (vendorId) {
      this.cache.deleteByPrefix(vendorId);
    } else {
      this.cache.clear();
    }
  }

  async findByVendor(vendorId: string, includeUnavailable: boolean = false) {
    const cacheKey = `menu:vendor:${vendorId}:${includeUnavailable ? 'all' : 'avail'}`;
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.menuItem.findMany({
      where: {
        vendorId,
        deletedAt: null, // Only fetch non-deleted items
        ...(includeUnavailable ? {} : { isAvailable: true }),
      },
      orderBy: [
        { isDailySpecial: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    this.cache.set(cacheKey, data);
    return data;
  }

  async findOne(id: string) {
    const cacheKey = `menu:item:${id}`;
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: { vendor: true },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    this.cache.set(cacheKey, item);
    return item;
  }

  async create(userId: string, userRole: Role, dto: CreateMenuItemDto) {
    let targetVendorId = dto.vendorId;

    if (!targetVendorId || userRole !== Role.ADMIN) {
      const vendor = await this.prisma.vendor.findUnique({ where: { ownerId: userId } });
      if (!vendor) {
        throw new ForbiddenException('You do not own any vendor store');
      }
      targetVendorId = vendor.id;
    }

    const created = await this.prisma.menuItem.create({
      data: {
        vendorId: targetVendorId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        category: dto.category,
        isDailySpecial: dto.isDailySpecial ?? false,
        isAvailable: dto.isAvailable ?? true,
      },
    });

    this.clearCache(targetVendorId);
    return created;
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (item.vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the vendor owner can update this menu item');
    }

    this.clearCache(item.vendorId);
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.category && { category: dto.category }),
        ...(dto.isDailySpecial !== undefined && { isDailySpecial: dto.isDailySpecial }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      },
    });
  }

  async toggleSpecial(id: string, userId: string, userRole: Role, isDailySpecial: boolean) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (item.vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the vendor owner can toggle daily special status');
    }

    this.clearCache(item.vendorId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isDailySpecial },
    });
  }

  async toggleAvailable(id: string, userId: string, userRole: Role, isAvailable: boolean) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (item.vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the vendor owner can toggle availability');
    }

    this.clearCache(item.vendorId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: { vendor: true },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    if (item.vendor.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the vendor owner can delete this menu item');
    }

    this.clearCache(item.vendorId);
    // Soft Delete: Preserve historical order references while hiding from active menu
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isAvailable: false,
      },
    });
  }
}
