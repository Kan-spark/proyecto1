import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },

      include: {
        products: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado`,
      );
    }

    const { password, ...result } = user;

    return result;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    await this.findOne(id);

    if (updateUserDto.email) {
      const emailExists =
        await this.prisma.user.findFirst({
          where: {
            email: updateUserDto.email,
            NOT: { id },
          },
        });

      if (emailExists) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },

      data: updateUserDto,

      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }
}

