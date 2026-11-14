
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FoodItemController } from './food-item.controller';
import { FoodItemService } from './food-item.service';

@Module({
  imports: [PassportModule],
  controllers: [FoodItemController],
  providers: [FoodItemService],
  exports: [FoodItemService],
})
export class FoodItemModule {}
