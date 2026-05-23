import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    const { orderId, authorId, rating, comment } = createReviewDto;

    // 1. Verificar que el pedido exista
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`El pedido con ID ${orderId} no existe`);
    }

    // 2. Validar seguridad: El autor de la reseña debe ser el mismo comprador del pedido
    if (order.buyerId !== authorId) {
      throw new BadRequestException('No tienes permisos para calificar un pedido que no realizaste');
    }

    // 3. Validar si ya existe una reseña previa para este pedido (evitar duplicados)
    const existingReview = await this.prisma.review.findFirst({
      where: { orderId, authorId },
    });

    if (existingReview) {
      throw new BadRequestException('Ya has calificado este pedido anteriormente');
    }

    // 4. Guardar la calificación
    return this.prisma.review.create({
      data: {
        rating,
        comment,
        orderId,
        authorId,
      },
    });
  }

  // Obtener todas las reseñas de un productor específico para calcular su reputación
  async findByProducer(producerId: number) {
    return this.prisma.review.findMany({
      where: {
        order: {
          items: {
            some: {
              product: { producerId },
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