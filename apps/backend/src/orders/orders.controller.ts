import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role, OrderStatus } from '@campus-food/shared-types';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new order (Student or Authenticated User)' })
  async createOrder(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Vendor owner only - Triggers WS notification on ready)' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, userId, role, dto);
  }

  @Patch(':id/confirm-receipt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student confirms receipt of their order (marks as completed)' })
  async confirmOrderReceipt(
    @Param('id') orderId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.confirmOrderReceipt(orderId, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student cancels their order (while pending)' })
  async cancelOrderByStudent(
    @Param('id') orderId: string,
    @CurrentUser('sub') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrderByStudent(orderId, userId, reason);
  }



  @Get('vendor/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order queue for a vendor' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  async getVendorOrders(
    @Param('vendorId') vendorId: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.getVendorOrders(vendorId, status);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history for a student (own orders only, or Admin)' })
  async getStudentOrders(
    @Param('studentId') studentId: string,
    @CurrentUser('sub') requestingUserId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.getStudentOrders(studentId, requestingUserId, role);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my order history' })
  async getMyOrders(@CurrentUser('sub') userId: string, @CurrentUser('role') role: Role) {
    return this.ordersService.getStudentOrders(userId, userId, role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }
}
