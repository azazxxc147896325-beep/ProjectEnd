import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ToggleVendorOpenDto } from './dto/toggle-open.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@campus-food/shared-types';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all vendors (Optionally filter by onlyOpen)' })
  @ApiQuery({ name: 'onlyOpen', required: false, type: Boolean })
  async findAll(@Query('onlyOpen') onlyOpen?: string) {
    return this.vendorsService.findAll(onlyOpen === 'true');
  }

  @Get('my-vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current vendor profile of logged-in user' })
  async getMyVendor(@CurrentUser('sub') userId: string) {
    return this.vendorsService.findByOwner(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single vendor details by ID including available menus' })
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create vendor profile' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vendor profile' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(id, userId, role, dto);
  }

  @Patch(':id/toggle-open')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle vendor open/closed status' })
  async toggleOpen(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: ToggleVendorOpenDto,
  ) {
    return this.vendorsService.toggleOpen(id, userId, role, dto.isOpen);
  }
}
