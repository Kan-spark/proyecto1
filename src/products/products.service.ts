import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-product.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // 1. Verificar primero que el usuario exista en la BD
    const producer = await this.prisma.user.findUnique({
      where: { id: createProductDto.producerId },
    });

    if (!producer) {
      throw new NotFoundException(`El usuario con ID ${createProductDto.producerId} no existe`);
    }

    // 2. Validar que tenga el rol de PRODUCER
    if (producer.role !== Role.PRODUCER) {
      throw new ForbiddenException('Solo los usuarios con rol PRODUCER pueden publicar productos');
    }

    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(filters: GetProductsFilterDto) {
    const { category, location, minPrice, maxPrice, search } = filters;
    
    // Construimos las condiciones de búsqueda dinámicamente
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive', // No importa mayúsculas/minúsculas
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice); // Mayor o igual que
      if (maxPrice) where.price.lte = Number(maxPrice); // Menor o igual que
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        producer: {
          select: {
            fullName: true,
            phone: true,
            isVerified: true, // Para mostrar la insignia de confianza en la app
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Lo más fresco/reciente primero
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        producer: {
          select: {
            fullName: true,
            phone: true,
            isVerified: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  // Agregamos userId para validar quién solicita el cambio
  async update(id: number, userId: number, updateProductDto: UpdateProductDto) {
    // 1. Validar que el producto exista
    const product = await this.findOne(id);

    // 2. Buscar al usuario que intenta hacer la edición
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    // 3. Validar rol y que el producto le pertenezca a él
    if (user.role !== Role.PRODUCER || product.producerId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este producto (Debe ser tuyo y debes ser PRODUCER)');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // Agregamos userId para validar quién solicita borrar
  async remove(id: number, userId: number) {
    // 1. Validar que el producto exista
    const product = await this.findOne(id);

    // 2. Buscar al usuario que intenta eliminar
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    // 3. Validar rol y propiedad del producto
    if (user.role !== Role.PRODUCER || product.producerId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este producto');
    }

    await this.prisma.product.delete({
      where: { id },
    });
    return { message: `Producto con ID ${id} eliminado correctamente` };
  }
}