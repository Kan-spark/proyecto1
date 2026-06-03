import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Crear pedido
  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(
      user.id,
      createOrderDto,
    );
  }

  // Historial del usuario autenticado
  @Get('my-orders')
  findMyOrders(
    @CurrentUser() user: any,
    @Query('role') role: 'BUYER' | 'PRODUCER',
  ) {
    return this.ordersService.findAllByUser(
      user.id,
      role,
    );
  }

  // Obtener pedido por ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(id);
  }

  // Actualizar estado del pedido
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      user.id,
      updateOrderStatusDto,
    );
  }
}