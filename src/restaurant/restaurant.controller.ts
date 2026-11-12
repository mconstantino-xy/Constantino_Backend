
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
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
@UseGuards(AuthGuard('jwt'))
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
  ) {}

  @Get()
  getAll() {
    return this.restaurantService.getAll();
  }

  @Post()
  create(@Body() body: {
    restaurant_name: string;
    phone: string;
    address: string;
    status?: string;
  }) {
    return this.restaurantService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      restaurant_name?: string;
      phone?: string;
      address?: string;
      status?: string;
    },
  ) {
    return this.restaurantService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.delete(id);
  }
}
