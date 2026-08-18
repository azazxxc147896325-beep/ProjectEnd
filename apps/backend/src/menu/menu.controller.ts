import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ToggleMenuItemSpecialDto } from './dto/toggle-special.dto';
import { ToggleMenuItemAvailableDto } from './dto/toggle-available.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@campus-food/shared-types';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get menu items of a specific vendor' })
  @ApiQuery({ name: 'includeUnavailable', required: false, type: Boolean })
  async findByVendor(
    @Param('vendorId') vendorId: string,
    @Query('includeUnavailable') includeUnavailable?: string,
  ) {
    return this.menuService.findByVendor(vendorId, includeUnavailable === 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single menu item by ID' })
  async findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new menu item (Vendor only)' })
  async create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuService.create(userId, role, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item details (Vendor only)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, userId, role, dto);
  }

  @Patch(':id/toggle-special')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle menu daily special tag' })
  async toggleSpecial(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: ToggleMenuItemSpecialDto,
  ) {
    return this.menuService.toggleSpecial(id, userId, role, dto.isDailySpecial);
  }

  @Patch(':id/toggle-available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle menu item in-stock / out-of-stock availability' })
  async toggleAvailable(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: ToggleMenuItemAvailableDto,
  ) {
    return this.menuService.toggleAvailable(id, userId, role, dto.isAvailable);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item (Vendor only)' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.menuService.delete(id, userId, role);
  }
}
