
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class OrderDetailService {
  constructor(private readonly db: DatabaseService) {}

  async getByOrder(orderId: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        od.order_detail_id,
        od.order_id,
        od.food_item_id,
        fi.food_name,
        od.quantity,
        od.price,
        od.subtotal
      FROM order_detail od
      LEFT JOIN food_item fi
        ON od.food_item_id = fi.food_item_id
      WHERE od.order_id = ?
      ORDER BY od.order_detail_id ASC`,
      [orderId],
    );

    return rows;
  }

  async create(data: {
    order_id: number;
    food_item_id: number;
    quantity: number;
  }) {
    const { order_id, food_item_id, quantity } = data;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new BadRequestException(
        'Quantity must be a positive whole number',
      );
    }

    const [orders] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT order_id FROM orders WHERE order_id = ?',
      [order_id],
    );

    if (orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const [foods] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT price, availability
       FROM food_item
       WHERE food_item_id = ?`,
      [food_item_id],
    );

    if (foods.length === 0) {
      throw new NotFoundException('Food item not found');
    }

    if (foods[0].availability !== 'Available') {
      throw new BadRequestException('Food item is not available');
    }

    const price = Number(foods[0].price);
    const subtotal = price * quantity;

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO order_detail
       (order_id, food_item_id, quantity, price, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [order_id, food_item_id, quantity, price, subtotal],
    );

    return {
      message: 'Order detail created successfully',
      order_detail_id: result.insertId,
      price,
      quantity,
      subtotal,
    };
  }
}