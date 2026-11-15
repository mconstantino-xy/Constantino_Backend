
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
import { PaymentService } from './payment.service';

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  getAll() {
    return this.paymentService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      order_id: number;
      payment_method: string;
      amount: number;
      payment_status?: string;
    },
  ) {
    return this.paymentService.create(body);
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
  ) {
    return this.paymentService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.delete(id);
  }
}
