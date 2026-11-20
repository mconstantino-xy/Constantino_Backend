
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private checkAdmin(req: Request) {
    const user = req.user as { role?: string };

    if (user?.role !== 'admin') {
      throw new ForbiddenException(
        'Admin access only',
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(@Req() req: Request) {
    this.checkAdmin(req);
    return this.usersService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.usersService.findById(+id);
  }

  @Post()
  async create(
    @Body() body: {
      username: string;
      password: string;
    },
  ) {
    return this.usersService.createUser(
      body.username,
      body.password,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.usersService.updateUser(+id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    this.checkAdmin(req);
    return this.usersService.deleteUser(+id);
  }
}
