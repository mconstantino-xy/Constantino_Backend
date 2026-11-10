
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }
}
