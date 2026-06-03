import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, {
    message:
      'El pedido debe incluir al menos un producto',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}