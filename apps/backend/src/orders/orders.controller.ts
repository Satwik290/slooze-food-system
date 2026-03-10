import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  findAll(
    @CurrentUser()
    user: {
      userId: string;
      email: string;
      role: string;
      regionId: string;
    },
  ) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Post(':id/checkout')
  @Roles(Role.ADMIN, Role.MANAGER)
  checkout(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.ordersService.checkout(id, user);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  cancel(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; email: string; role: string; regionId: string },
  ) {
    return this.ordersService.cancel(id, user);
  }
}
