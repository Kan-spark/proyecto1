import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'El estado no es válido (PENDING, CONFIRMED, DELIVERED, CANCELLED)' })
  @IsNotEmpty()
  status: OrderStatus;
}