import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar si el correo ya existe para evitar errores duplicados
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Nota: En producción, recuerda encriptar la contraseña aquí (ej: bcrypt)
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        isVerified: false, // Por defecto inician sin verificar hasta revisión básica
      },
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

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        products: true, // Útil si es productor para ver su catálogo de inmediato
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Removemos la contraseña por seguridad antes de responder al cliente
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc', // Muestra primero los registros más nuevos
      },
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




  async update(id: number, updateUserDto: UpdateUserDto) {
    // 1. Verificar si el usuario existe
    await this.findOne(id);

    // 2. Si va a cambiar el email, verificar que no esté duplicado
    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });
      if (emailExists) {
        throw new ConflictException('El correo electrónico ya está en uso por otro usuario');
      }
    }

    // 3. Actualizar datos
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
      },
    });
  }

  async remove(id: number) {
    // Verificar si existe antes de borrar
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }
}

