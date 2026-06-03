// src/auth/dto/register.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone: string;

  @IsEnum(Role, {
    message: 'El rol debe ser PRODUCER o BUYER',
  })
  role: Role;
}