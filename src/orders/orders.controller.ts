
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
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { OrdersService } from './orders.service';

type AuthRequest = Request & {
  user: {
    userId: number;
    role: string;
  };
};

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  private checkAdmin(req: AuthRequest) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }
  }

  @Get()
  getAll(@Req() req: AuthRequest) {
    this.checkAdmin(req);
    return this.ordersService.getAll();
  }

  @Get('user/:userId')
  getByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== 'admin' &&
      req.user.userId !== userId
    ) {
      throw new ForbiddenException(
        'You can only view your own orders',
      );
    }

    return this.ordersService.getByUser(userId);
  }

  @Post()
  create(
    @Body() body: {
      user_id?: number;
      restaurant_id: number;
      total_amount?: number;
      order_status?: string;
    },
    @Req() req: AuthRequest,
  ) {
    const userId =
      req.user.role === 'admin'
        ? Number(body.user_id)
        : req.user.userId;

    if (!userId) {
      throw new ForbiddenException('Invalid user');
    }

    return this.ordersService.create({
      ...body,
      user_id: userId,
      total_amount:
        req.user.role === 'admin'
          ? body.total_amount
          : 0,
      order_status:
        req.user.role === 'admin'
          ? body.order_status
          : 'Pending',
    });
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
    @Req() req: AuthRequest,
  ) {
    this.checkAdmin(req);
    return this.ordersService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    this.checkAdmin(req);
    return this.ordersService.delete(id);
  }
}
