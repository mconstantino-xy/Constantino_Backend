import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  getAll() {
    return this.ordersService.getAll();
  }

  @Get('user/:userId')
  getByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.ordersService.getByUser(userId);
  }
}