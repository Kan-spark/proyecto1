import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Crear pedido
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Historial por usuario
  // Ejemplo:
  // GET /orders/user/1?role=BUYER
  // GET /orders/user/2?role=PRODUCER
  @Get('user/:userId')
  findAllByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('role') role: 'BUYER' | 'PRODUCER',
  ) {
    return this.ordersService.findAllByUser(userId, role);
  }

  // Obtener pedido por ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(id);
  }

  // Actualizar estado del pedido
  // PATCH /orders/1/status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
    );
  }
}