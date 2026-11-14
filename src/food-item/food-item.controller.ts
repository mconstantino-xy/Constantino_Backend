
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { FoodItemService } from './food-item.service';

@Controller('food-item')
@UseGuards(AuthGuard('jwt'))
export class FoodItemController {
  constructor(
    private readonly foodItemService: FoodItemService,
  ) {}

  @Get()
  getAll() {
    return this.foodItemService.getAll();
  }
}
