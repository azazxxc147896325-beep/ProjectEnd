import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@campus-food/shared-types';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    vendor: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock_access_token_xyz'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new student user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'user-1',
        email: 'student@cmu.ac.th',
        fullName: 'Somchai Jaidee',
        role: Role.STUDENT,
        phone: '0812345678',
        createdAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register({
        email: 'student@cmu.ac.th',
        password: 'password123',
        fullName: 'Somchai Jaidee',
        role: Role.STUDENT,
        phone: '0812345678',
      });

      expect(result.accessToken).toBe('mock_access_token_xyz');
      expect(result.user.email).toBe('student@cmu.ac.th');
      expect(result.user.fullName).toBe('Somchai Jaidee');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.vendor.create).not.toHaveBeenCalled();
    });

    it('should auto-provision vendor profile when registering with VENDOR role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'vendor-user-1',
        email: 'vendor@cmu.ac.th',
        fullName: 'Pa Somjai',
        role: Role.VENDOR,
        createdAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockPrismaService.vendor.create.mockResolvedValue({
        id: 'vendor-store-1',
        ownerId: 'vendor-user-1',
        name: "Pa Somjai's Kitchen",
      });

      const result = await service.register({
        email: 'vendor@cmu.ac.th',
        password: 'password123',
        fullName: 'Pa Somjai',
        role: Role.VENDOR,
      });

      expect(result.accessToken).toBe('mock_access_token_xyz');
      expect(mockPrismaService.vendor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerId: 'vendor-user-1',
          name: "Pa Somjai's Kitchen",
        }),
      });
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'duplicate@cmu.ac.th',
      });

      await expect(
        service.register({
          email: 'duplicate@cmu.ac.th',
          password: 'password123',
          fullName: 'Test User',
          role: Role.STUDENT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return token when credentials match', async () => {
      const plainPassword = 'correctPassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'student@cmu.ac.th',
        password: hashedPassword,
        fullName: 'Somchai Jaidee',
        role: Role.STUDENT,
        createdAt: new Date(),
        vendor: null,
      });

      const result = await service.login({
        email: 'student@cmu.ac.th',
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock_access_token_xyz');
      expect(result.user.email).toBe('student@cmu.ac.th');
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@cmu.ac.th',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'student@cmu.ac.th',
        password: hashedPassword,
      });

      await expect(
        service.login({
          email: 'student@cmu.ac.th',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user profile without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'student@cmu.ac.th',
        password: 'hashed_password_secret',
        fullName: 'Somchai Jaidee',
        role: Role.STUDENT,
      });

      const profile = await service.getMe('user-1');
      expect(profile.id).toBe('user-1');
      expect(profile.email).toBe('student@cmu.ac.th');
      expect((profile as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshTokens', () => {
    it('should issue new tokens when a valid refresh token is provided', async () => {
      (mockJwtService as any).verify = jest.fn().mockReturnValue({
        sub: 'user-1',
        email: 'student@cmu.ac.th',
        role: Role.STUDENT,
        type: 'refresh',
      });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'student@cmu.ac.th',
        fullName: 'Somchai Jaidee',
        role: Role.STUDENT,
        vendor: null,
      });

      const result = await service.refreshTokens('valid_refresh_token');
      expect(result.accessToken).toBe('mock_access_token_xyz');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('student@cmu.ac.th');
    });

    it('should throw UnauthorizedException if token verification fails or is invalid type', async () => {
      (mockJwtService as any).verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.refreshTokens('bad_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user in token no longer exists in DB', async () => {
      (mockJwtService as any).verify = jest.fn().mockReturnValue({
        sub: 'deleted-user',
        email: 'deleted@cmu.ac.th',
        role: Role.STUDENT,
        type: 'refresh',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('token_for_deleted_user')).rejects.toThrow(UnauthorizedException);
    });
  });
});
