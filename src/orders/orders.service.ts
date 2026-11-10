import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  // Get all orders with customer and restaurant information
  async getAll() {
    const [rows] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(`
        SELECT
          o.order_id,
          o.user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          o.restaurant_id,
          r.restaurant_name,
          o.order_date,
          o.total_amount,
          o.order_status
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant r
          ON o.restaurant_id = r.restaurant_id
        ORDER BY o.order_date DESC
      `);

    return rows;
  }

  // Get orders belonging to a specific user
  async getByUser(userId: number) {
    const [rows] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(
        `SELECT
          o.order_id,
          o.user_id,
          u.username,
          u.first_name,
          u.last_name,
          o.restaurant_id,
          r.restaurant_name,
          o.order_date,
          o.total_amount,
          o.order_status
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant r
          ON o.restaurant_id = r.restaurant_id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC`,
        [userId],
      );

    return rows;
  }
}