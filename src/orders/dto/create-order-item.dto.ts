import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber({}, { message: 'El ID del producto debe ser un número válido' })
  @IsNotEmpty()
  productId: number;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.1, { message: 'La cantidad mínima de compra debe ser mayor a 0' })
  quantity: number;
}