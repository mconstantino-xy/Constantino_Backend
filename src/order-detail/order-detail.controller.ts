
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { OrderDetailService } from './order-detail.service';

type AuthRequest = Request & {
  user: {
    userId: number;
    role: string;
  };
};

@Controller('order-detail')
@UseGuards(AuthGuard('jwt'))
export class OrderDetailController {
  constructor(
    private readonly orderDetailService: OrderDetailService,
  ) {}

  @Get()
  getAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.orderDetailService.getAll();
  }

  @Get('order/:orderId')
  getByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthRequest,
  ) {
    return this.orderDetailService.getByOrder(
      orderId,
      req.user.userId,
      req.user.role === 'admin',
    );
  }

  @Post()
  create(
    @Body() body: {
      order_id: number;
      food_item_id: number;
      quantity: number;
    },
    @Req() req: AuthRequest,
  ) {
    return this.orderDetailService.create(
      body,
      req.user.userId,
      req.user.role === 'admin',
    );
  }
}
