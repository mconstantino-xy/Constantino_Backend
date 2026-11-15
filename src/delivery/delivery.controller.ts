
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
import { DeliveryService } from './delivery.service';

@Controller('delivery')
@UseGuards(AuthGuard('jwt'))
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  @Get()
  getAll() {
    return this.deliveryService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deliveryService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      order_id: number;
      delivery_address: string;
      delivery_status?: string;
    },
  ) {
    return this.deliveryService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      delivery_address?: string;
      delivery_status?: string;
    },
  ) {
    return this.deliveryService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deliveryService.delete(id);
  }
}
