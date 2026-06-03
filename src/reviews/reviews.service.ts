import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const {
      orderId,
      rating,
      comment,
    } = createReviewDto;

    // 1. Verificar que el pedido exista
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `El pedido con ID ${orderId} no existe`,
      );
    }

    // 2. Verificar que el usuario autenticado
    // sea el comprador del pedido
    if (order.buyerId !== userId) {
      throw new BadRequestException(
        'No tienes permisos para calificar un pedido que no realizaste',
      );
    }

    // 3. Evitar reseñas duplicadas
    const existingReview =
      await this.prisma.review.findFirst({
        where: {
          orderId,
          authorId: userId,
        },
      });

    if (existingReview) {
      throw new BadRequestException(
        'Ya has calificado este pedido anteriormente',
      );
    }

    // 4. Guardar reseña
    return this.prisma.review.create({
      data: {
        rating,
        comment,
        orderId,
        authorId: userId,
      },
    });
  }

  async findByProducer(producerId: number) {
    return this.prisma.review.findMany({
      where: {
        order: {
          items: {
            some: {
              product: {
                producerId,
              },
            },
          },
        },
      },

      include: {
        author: {
          select: {
            fullName: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}