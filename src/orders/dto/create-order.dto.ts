import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNumber({}, { message: 'El ID del comprador debe ser un número válido' })
  @IsNotEmpty()
  buyerId: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto) // Mapea el arreglo al DTO de ítems para validarlos uno por uno
  items: CreateOrderItemDto[];
}