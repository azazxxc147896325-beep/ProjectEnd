import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Role } from '@campus-food/shared-types';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(onlyOpen?: boolean) {
    return this.prisma.vendor.findMany({
      where: onlyOpen ? { isOpen: true } : {},
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
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

    return vendor;
  }

  async findByOwner(ownerId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { ownerId },
      include: {
        menuItems: {
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

    return this.prisma.vendor.update({
      where: { id },
      data: { isOpen },
    });
  }
}
