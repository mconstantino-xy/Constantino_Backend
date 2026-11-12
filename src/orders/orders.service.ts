
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  // GET all orders with customer and restaurant information
  async getAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(`
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
      LEFT JOIN restaurant r ON o.restaurant_id = r.restaurant_id
      ORDER BY o.order_date DESC
    `);

    return rows;
  }

  // GET orders by user ID
  async getByUser(userId: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
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
      LEFT JOIN restaurant r ON o.restaurant_id = r.restaurant_id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC`,
      [userId],
    );

    return rows;
  }

  // POST new order
  async create(data: {
    user_id: number;
    restaurant_id: number;
    total_amount?: number;
    order_status?: string;
  }) {
    const {
      user_id,
      restaurant_id,
      total_amount = 0,
      order_status = 'Pending',
    } = data;

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO orders
       (user_id, restaurant_id, total_amount, order_status)
       VALUES (?, ?, ?, ?)`,
      [user_id, restaurant_id, total_amount, order_status],
    );

    return {
      message: 'Order created successfully',
      order_id: result.insertId,
    };
  }

  // PUT update order
  async update(
    id: number,
    data: {
      user_id?: number;
      restaurant_id?: number;
      total_amount?: number;
      order_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.user_id !== undefined) {
      fields.push('user_id = ?');
      values.push(data.user_id);
    }

    if (data.restaurant_id !== undefined) {
      fields.push('restaurant_id = ?');
      values.push(data.restaurant_id);
    }

    if (data.total_amount !== undefined) {
      fields.push('total_amount = ?');
      values.push(data.total_amount);
    }

    if (data.order_status !== undefined) {
      fields.push('order_status = ?');
      values.push(data.order_status);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    values.push(id);

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `UPDATE orders SET ${fields.join(', ')}
       WHERE order_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
        'SELECT order_id FROM orders WHERE order_id = ?',
        [id],
      );

      if (rows.length === 0) {
        throw new NotFoundException('Order not found');
      }
    }

    return { message: 'Order updated successfully' };
  }

  // DELETE order
  async delete(id: number) {
    // Check if order has related records
    const [references] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM order_detail WHERE order_id = ?) AS detail_count,
        (SELECT COUNT(*) FROM payment WHERE order_id = ?) AS payment_count,
        (SELECT COUNT(*) FROM delivery WHERE order_id = ?) AS delivery_count`,
      [id, id, id],
    );

    if (
      Number(references[0].detail_count) > 0 ||
      Number(references[0].payment_count) > 0 ||
      Number(references[0].delivery_count) > 0
    ) {
      throw new BadRequestException(
        'Cannot delete order because it has related order details, payments, or delivery records',
      );
    }

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      'DELETE FROM orders WHERE order_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Order not found');
    }

    return { message: 'Order deleted successfully' };
  }
}
