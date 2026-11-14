
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { OrderDetailService } from './order-detail.service';

@Controller('order-detail')
@UseGuards(AuthGuard('jwt'))
export class OrderDetailController {
  constructor(
    private readonly orderDetailService: OrderDetailService,
  ) {}

  @Get('order/:orderId')
  getByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderDetailService.getByOrder(orderId);
  }

  @Post()
  create(
    @Body() body: {
      order_id: number;
      food_item_id: number;
      quantity: number;
    },
  ) {
    return this.orderDetailService.create(body);
  }
}