import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, JwtPayload, Role } from '@campus-food/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role,
        phone: dto.phone,
      },
    });

    // If role is vendor, automatically provision an initial store profile if none exists
    let vendorId: string | undefined;
    if (user.role === Role.VENDOR) {
      const vendor = await this.prisma.vendor.create({
        data: {
          ownerId: user.id,
          name: `${user.fullName}'s Kitchen`,
          description: 'Delicious food made with love for campus students',
          isOpen: true,
        },
      });
      vendorId = vendor.id;
    }

    const tokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      vendorId,
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { vendor: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      vendorId: user.vendor?.id,
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        phone: user.phone,
        createdAt: user.createdAt,
        vendor: user.vendor
          ? {
              id: user.vendor.id,
              ownerId: user.vendor.ownerId,
              name: user.vendor.name,
              description: user.vendor.description,
              logoUrl: user.vendor.logoUrl,
              isOpen: user.vendor.isOpen,
            }
          : null,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
