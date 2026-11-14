import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { OrdersModule } from './orders/orders.module';
import { FoodItemModule } from './food-item/food-item.module';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    RestaurantModule,
    OrdersModule,
    FoodItemModule,
  ],
})
export class AppModule {}