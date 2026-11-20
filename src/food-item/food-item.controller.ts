
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
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FoodItemService } from './food-item.service';

@Controller('food-item')
@UseGuards(AuthGuard('jwt'))
export class FoodItemController {
  constructor(
    private readonly foodItemService: FoodItemService,
  ) {}

  private checkAdmin(req: Request) {
    const user = req.user as { role?: string };

    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }
  }

  @Get()
  getAll() {
    return this.foodItemService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.getOne(id);
  }

  @Post()
  create(
    @Body() body: any,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.foodItemService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.foodItemService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.foodItemService.delete(id);
  }
}
