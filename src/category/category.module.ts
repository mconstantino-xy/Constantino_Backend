
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [PassportModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

