
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
import { PaymentService } from './payment.service';

type AuthRequest = Request & {
  user: {
    userId: number;
    role: string;
  };
};

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  getAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.paymentService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.paymentService.getByIdForUser(
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
      payment_method: string;
    },
    @Req() req: AuthRequest,
  ) {
    return this.paymentService.create(
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
      payment_method?: string;
      amount?: number;
      payment_status?: string;
    },
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.paymentService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.paymentService.delete(id);
  }
}
