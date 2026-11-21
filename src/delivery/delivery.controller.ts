
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
import { DeliveryService } from './delivery.service';

type AuthRequest = Request & {
  user: {
    userId: number;
    role: string;
  };
};

@Controller('delivery')
@UseGuards(AuthGuard('jwt'))
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  // ADMIN ONLY: Get all deliveries
  @Get()
  getAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.deliveryService.getAll();
  }

  // CUSTOMER AND ADMIN: Get delivery using order ID
  @Get('order/:orderId')
  getByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthRequest,
  ) {
    return this.deliveryService.getByOrderForUser(
      orderId,
      req.user.userId,
      req.user.role === 'admin',
    );
  }

  // CUSTOMER AND ADMIN: Get delivery by ID
  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.deliveryService.getByIdForUser(
      id,
      req.user.userId,
      req.user.role === 'admin',
    );
  }

  // CUSTOMER AND ADMIN: Create delivery for own order
  @Post()
  create(
    @Body()
    body: {
      order_id: number;
      delivery_contact: string;
      delivery_address: string;
    },
    @Req() req: AuthRequest,
  ) {
    return this.deliveryService.create(
      body,
      req.user.userId,
      req.user.role === 'admin',
    );
  }

  // ADMIN ONLY: Update delivery
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      delivery_contact?: string;
      delivery_address?: string;
      delivery_status?: string;
    },
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.deliveryService.update(id, body);
  }

  // ADMIN ONLY: Delete delivery
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.deliveryService.delete(id);
  }
}
