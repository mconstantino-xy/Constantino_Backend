
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.getOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.foodItemService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.foodItemService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.delete(id);
  }
}