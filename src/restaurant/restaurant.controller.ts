
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
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
@UseGuards(AuthGuard('jwt'))
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
  ) {}

  private checkAdmin(req: Request) {
    const user = req.user as { role?: string };

    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }
  }

  @Get()
  getAll() {
    return this.restaurantService.getAll();
  }

  @Post()
  create(
    @Body() body: {
      restaurant_name: string;
      phone: string;
      address: string;
      status?: string;
    },
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
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
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.restaurantService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.restaurantService.delete(id);
  }
}
