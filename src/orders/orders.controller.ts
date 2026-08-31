import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Turns the logged-in user's current cart into an order.
  @Post('checkout')
  checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.userId, dto);
  }

  // Logged-in user's own order history.
  @Get('my-orders')
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  // Admin — every order from every customer.
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // Owner or admin only (enforced inside the service).
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.userId, req.user.role === 'admin');
  }

  // Admin updates order status (confirmed / shipped / completed / etc).
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  // Customer cancels their own still-pending order; stock is restored.
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.userId);
  }
}
