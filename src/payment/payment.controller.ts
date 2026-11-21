
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

  // ADMIN ONLY: Get all payments
  @Get()
  getAll(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return this.paymentService.getAll();
  }

  // CUSTOMER AND ADMIN: Get payment by order
  @Get('order/:orderId')
  getByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthRequest,
  ) {
    return this.paymentService.getByOrderForUser(
      orderId,
      req.user.userId,
      req.user.role === 'admin',
    );
  }

  // CUSTOMER AND ADMIN: Get payment by ID
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

  // CUSTOMER AND ADMIN: Create payment for own order
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

  // ADMIN ONLY: Update payment
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

  // ADMIN ONLY: Delete payment
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
