import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-product.dto';

import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createProductDto: CreateProductDto,
  ) {
    const producer = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!producer) {
      throw new NotFoundException(
        `Usuario con ID ${userId} no encontrado`,
      );
    }

    if (producer.role !== Role.PRODUCER) {
      throw new ForbiddenException(
        'Solo los usuarios con rol PRODUCER pueden publicar productos',
      );
    }
    
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        producerId: userId,
      },
    });
  }

  async findAll(filters: GetProductsFilterDto) {
    const { category, location, minPrice, maxPrice, search } = filters;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price.gte = Number(minPrice);
      }

      if (maxPrice) {
        where.price.lte = Number(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        producer: {
          select: {
            fullName: true,
            phone: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado`,
      );
    }

    return product;
  }

  async update(
    id: number,
    userId: number,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.findOne(id);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${userId} no encontrado`,
      );
    }

    if (
      user.role !== Role.PRODUCER ||
      product.producerId !== userId
    ) {
      throw new ForbiddenException(
        'No tienes permisos para editar este producto (Debe ser tuyo y debes ser PRODUCER)',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(
    id: number,
    userId: number,
  ) {
    const product = await this.findOne(id);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${userId} no encontrado`,
      );
    }

    if (
      user.role !== Role.PRODUCER ||
      product.producerId !== userId
    ) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este producto',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: `Producto con ID ${id} eliminado correctamente`,
    };
  }
}