
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class FoodItemService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async getAll() {
    const [rows] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(`
        SELECT
          fi.food_item_id,
          fi.restaurant_id,
          r.restaurant_name,
          fi.category_id,
          c.category_name,
          fi.food_name,
          fi.description,
          fi.price,
          fi.availability
        FROM food_item fi
        LEFT JOIN restaurant r
          ON fi.restaurant_id = r.restaurant_id
        LEFT JOIN category c
          ON fi.category_id = c.category_id
        ORDER BY fi.food_item_id ASC
      `);

    return rows;
  }
}
