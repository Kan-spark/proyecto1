import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Category } from '@prisma/client';

export class GetProductsFilterDto {
  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  minPrice?: string; // Llegan como string por la URL del query parametrizado

  @IsOptional()
  maxPrice?: string;

  @IsString()
  @IsOptional()
  search?: string; // Para buscar por palabras clave como "Papa" o "Camarón"
}