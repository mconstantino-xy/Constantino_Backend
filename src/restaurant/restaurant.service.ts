
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class RestaurantService {
  constructor(private readonly db: DatabaseService) {}

  // GET all restaurants
  async getAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT * FROM restaurant',
    );

    return rows;
  }

  // POST new restaurant
  async create(data: {
    restaurant_name: string;
    phone: string;
    address: string;
    status?: string;
  }) {
    const {
      restaurant_name,
      phone,
      address,
      status = 'Active',
    } = data;

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO restaurant
       (restaurant_name, phone, address, status)
       VALUES (?, ?, ?, ?)`,
      [restaurant_name, phone, address, status],
    );

    return {
      message: 'Restaurant created successfully',
      restaurant_id: result.insertId,
    };
  }

  // PUT update restaurant
  async update(
    id: number,
    data: {
      restaurant_name?: string;
      phone?: string;
      address?: string;
      status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.restaurant_name !== undefined) {
      fields.push('restaurant_name = ?');
      values.push(data.restaurant_name);
    }

    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }

    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    values.push(id);

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `UPDATE restaurant SET ${fields.join(', ')}
       WHERE restaurant_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
        'SELECT restaurant_id FROM restaurant WHERE restaurant_id = ?',
        [id],
      );

      if (rows.length === 0) {
        throw new NotFoundException('Restaurant not found');
      }
    }

    return { message: 'Restaurant updated successfully' };
  }

  // DELETE restaurant
  async delete(id: number) {
    // Check if restaurant is referenced by orders or food items
    const [references] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM orders WHERE restaurant_id = ?) AS order_count,
        (SELECT COUNT(*) FROM food_item WHERE restaurant_id = ?) AS food_count`,
      [id, id],
    );

    if (
      Number(references[0].order_count) > 0 ||
      Number(references[0].food_count) > 0
    ) {
      throw new BadRequestException(
        'Cannot delete restaurant because it has existing orders or food items',
      );
    }

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      'DELETE FROM restaurant WHERE restaurant_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Restaurant not found');
    }

    return { message: 'Restaurant deleted successfully' };
  }
}
