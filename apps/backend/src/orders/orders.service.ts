import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    const { restaurantId, items } = createOrderDto;

    // Validate restaurant
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (user.role !== 'ADMIN' && restaurant.regionId !== user.regionId) {
      throw new ForbiddenException(
        'You cannot order from a restaurant outside your region',
      );
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (
        !dbItem ||
        !dbItem.isAvailable ||
        dbItem.restaurantId !== restaurantId
      ) {
        throw new BadRequestException(
          `Invalid menu item ID: ${item.menuItemId}`,
        );
      }

      totalPrice += dbItem.price * item.quantity;
      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: dbItem.price,
      });
    }

    return this.prisma.order.create({
      data: {
        userId: user.userId,
        restaurantId,
        totalPrice,
        status: OrderStatus.CART,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });
  }

  async findAll(user: {
    userId: string;
    email: string;
    role: string;
    regionId: string;
  }) {
    if (user.role === 'ADMIN') {
      return this.prisma.order.findMany({
        include: { restaurant: true, user: true },
      });
    }
    if (user.role === 'MANAGER') {
      // Find orders belonging to that region
      return this.prisma.order.findMany({
        where: {
          restaurant: {
            regionId: user.regionId,
          },
        },
        include: { restaurant: true, user: true },
      });
    }

    // Member: only their own orders
    return this.prisma.order.findMany({
      where: { userId: user.userId },
      include: { restaurant: true },
    });
  }

  async findOne(
    id: string,
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (user.role === 'MEMBER' && order.userId !== user.userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (
      user.role === 'MANAGER' &&
      order.restaurant.regionId !== user.regionId
    ) {
      throw new ForbiddenException('Cannot view order outside your region');
    }

    return order;
  }

  async checkout(
    id: string,
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    const order = await this.findOne(id, user);

    if (order.status !== OrderStatus.CART) {
      throw new BadRequestException('Order is not in CART state');
    }

    // Move to PENDING_PAYMENT or CONFIRMED based on business logic.
    // For MVP, move instantly to CONFIRMED or PENDING_PAYMENT
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Create a mock payment record
    await this.prisma.payment.create({
      data: {
        method: 'CREDIT_CARD',
        amount: updatedOrder.totalPrice,
        paymentStatus: 'COMPLETED',
        orderId: updatedOrder.id,
      },
    });

    return updatedOrder;
  }

  async cancel(
    id: string,
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    const order = await this.findOne(id, user);

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Order cannot be cancelled in its current state',
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
