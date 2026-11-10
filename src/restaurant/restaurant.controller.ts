import { Controller, Get, UseGuards } from '@nestjs/common';
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
}