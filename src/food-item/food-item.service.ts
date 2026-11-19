
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

  async getOne(id: number) {
    const [rows] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(
        `SELECT * FROM food_item WHERE food_item_id = ?`,
        [id],
      );

    if (rows.length === 0) {
      throw new NotFoundException('Food item not found.');
    }

    return rows[0];
  }

  async create(body: any) {
    const {
      restaurant_id,
      category_id,
      food_name,
      description,
      price,
      availability,
    } = body;

    if (
      !restaurant_id ||
      !category_id ||
      !food_name ||
      price === undefined ||
      Number(price) <= 0
    ) {
      throw new BadRequestException(
        'Please provide valid restaurant, category, food name, and price.',
      );
    }

    const [result] = await this.db
      .getPool()
      .execute<ResultSetHeader>(
        `INSERT INTO food_item
        (restaurant_id, category_id, food_name, description, price, availability)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          restaurant_id,
          category_id,
          food_name,
          description || null,
          price,
          availability || 'Available',
        ],
      );

    return this.getOne(result.insertId);
  }

  async update(id: number, body: any) {
    await this.getOne(id);

    const {
      restaurant_id,
      category_id,
      food_name,
      description,
      price,
      availability,
    } = body;

    if (
      !restaurant_id ||
      !category_id ||
      !food_name ||
      price === undefined ||
      Number(price) <= 0
    ) {
      throw new BadRequestException(
        'Please provide valid restaurant, category, food name, and price.',
      );
    }

    await this.db
      .getPool()
      .execute(
        `UPDATE food_item
         SET restaurant_id = ?,
             category_id = ?,
             food_name = ?,
             description = ?,
             price = ?,
             availability = ?
         WHERE food_item_id = ?`,
        [
          restaurant_id,
          category_id,
          food_name,
          description || null,
          price,
          availability || 'Available',
          id,
        ],
      );

    return this.getOne(id);
  }

  async delete(id: number) {
    await this.getOne(id);

    await this.db
      .getPool()
      .execute(
        `DELETE FROM food_item WHERE food_item_id = ?`,
        [id],
      );

    return {
      message: 'Food item deleted successfully.',
    };
  }
}