
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

  @Get()
  getAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.deliveryService.getAll();
  }

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

  @Post()
  create(
    @Body()
    body: {
      order_id: number;
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

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
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
