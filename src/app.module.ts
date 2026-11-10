
import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CategoryModule,
    UsersModule,
    RestaurantModule,
    OrdersModule,
  ],
})
export class AppModule {}
