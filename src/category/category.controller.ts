
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';

@Controller('category')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  getAll() {
    return this.categoryService.getAll();
  }
}
