
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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

  @Post()
  create(@Body() body: {
    user_id: number;
    restaurant_id: number;
    total_amount?: number;
    order_status?: string;
  }) {
    return this.ordersService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      user_id?: number;
      restaurant_id?: number;
      total_amount?: number;
      order_status?: string;
    },
  ) {
    return this.ordersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.delete(id);
  }
}
