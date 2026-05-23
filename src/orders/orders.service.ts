import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    const { buyerId, items } = createOrderDto;

    // 1. Validar comprador
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new NotFoundException(
        `El comprador con ID ${buyerId} no existe`,
      );
    }

    // 2. Ejecutar todo dentro de transacción
    return this.prisma.$transaction(async (tx) => {
      let orderTotal = 0;

      // Array tipado correctamente
      const itemsToCreate: {
        productId: number;
        quantity: number;
        price: number;
      }[] = [];

      // 3. Validar y procesar productos
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Validar existencia
        if (!product) {
          throw new NotFoundException(
            `El producto con ID ${item.productId} no existe`,
          );
        }

        // Validar stock
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.title}". Disponible: ${product.stock} ${product.unit}, Solicitado: ${item.quantity}`,
          );
        }

        // Descontar stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });

        // Calcular subtotal
        const itemPrice = Number(product.price);

        orderTotal += itemPrice * item.quantity;

        // Guardar item del pedido
        itemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: itemPrice, // precio histórico
        });
      }

      // 4. Crear pedido final
      return tx.order.create({
        data: {
          buyerId,
          total: orderTotal,
          status: 'PENDING',

          items: {
            create: itemsToCreate,
          },
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },

          buyer: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      });
    });
  }

  // Historial por usuario y rol
  async findAllByUser(userId: number, role: 'BUYER' | 'PRODUCER') {
    const whereClause =
      role === 'BUYER'
        ? {
          buyerId: userId,
        }
        : {
          items: {
            some: {
              product: {
                producerId: userId,
              },
            },
          },
        };

    return this.prisma.order.findMany({
      where: whereClause,

      include: {
        items: {
          include: {
            product: true,
          },
        },

        buyer: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obtener pedido por ID
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },

      include: {
        items: {
          include: {
            product: true,
          },
        },

        buyer: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Pedido con ID ${id} no encontrado`,
      );
    }

    return order;
  }

  // Actualizar estado del pedido
  async updateStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.findOne(id);

    // No permitir modificar pedidos entregados
    if (order.status === 'DELIVERED') {
      throw new BadRequestException(
        'No se puede modificar un pedido entregado',
      );
    }

    return this.prisma.order.update({
      where: { id },

      data: {
        status: updateOrderStatusDto.status,
      },
    });
  }
}