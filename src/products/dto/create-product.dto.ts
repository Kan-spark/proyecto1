import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Category } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({
    message: 'El título del producto es obligatorio',
  })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber(
    {},
    {
      message: 'El precio debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El precio no puede ser negativo',
  })
  price: number;

  @IsString()
  @IsNotEmpty({
    message:
      'La unidad de medida es obligatoria (ej: KG, Bulto)',
  })
  unit: string;

  @IsNumber(
    {},
    {
      message: 'El stock debe ser un número',
    },
  )
  @Min(0, {
    message: 'El stock no puede ser negativo',
  })
  stock: number;

  @IsString()
  @IsNotEmpty({
    message:
      'La ubicación de recogida es obligatoria',
  })
  location: string;

  @IsEnum(Category, {
    message:
      'La categoría debe ser PESQUERO o AGROPECUARIO',
  })
  category: Category;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}