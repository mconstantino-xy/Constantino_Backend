
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class DeliveryService {
  constructor(private readonly db: DatabaseService) {}

  async getAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        d.delivery_id,
        d.order_id,
        d.delivery_address,
        d.delivery_status,
        d.delivery_date
      FROM delivery d
      ORDER BY d.delivery_id DESC`,
    );

    return rows;
  }

  async getById(id: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        delivery_id,
        order_id,
        delivery_address,
        delivery_status,
        delivery_date
      FROM delivery
      WHERE delivery_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Delivery not found');
    }

    return rows[0];
  }

  async getByIdForUser(
    id: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        d.delivery_id,
        d.order_id,
        d.delivery_address,
        d.delivery_status,
        d.delivery_date,
        o.user_id
      FROM delivery d
      INNER JOIN orders o ON d.order_id = o.order_id
      WHERE d.delivery_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Delivery not found');
    }

    if (
      !isAdmin &&
      Number(rows[0].user_id) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You can only access your own delivery',
      );
    }

    const { user_id, ...delivery } = rows[0];
    return delivery;
  }

  async create(
    data: {
      order_id: number;
      delivery_address: string;
    },
    userId: number,
    isAdmin: boolean,
  ) {
    const { order_id, delivery_address } = data;

    if (
      !delivery_address ||
      delivery_address.trim().length === 0
    ) {
      throw new BadRequestException(
        'Delivery address is required',
      );
    }

    const [orders] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT user_id FROM orders WHERE order_id = ?',
      [order_id],
    );

    if (orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    if (
      !isAdmin &&
      Number(orders[0].user_id) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You can only create delivery for your own order',
      );
    }

    const [existingDeliveries] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(
        'SELECT delivery_id FROM delivery WHERE order_id = ?',
        [order_id],
      );

    if (existingDeliveries.length > 0) {
      throw new BadRequestException(
        'A delivery record already exists for this order',
      );
    }

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO delivery
       (order_id, delivery_address, delivery_status)
       VALUES (?, ?, ?)`,
      [order_id, delivery_address.trim(), 'Pending'],
    );

    return {
      message: 'Delivery created successfully',
      delivery_id: result.insertId,
      order_id,
      delivery_address: delivery_address.trim(),
      delivery_status: 'Pending',
    };
  }

  async update(
    id: number,
    data: {
      delivery_address?: string;
      delivery_status?: string;
    },
  ) {
    const existing = await this.getById(id);

    const delivery_address =
      data.delivery_address ?? existing.delivery_address;

    const delivery_status =
      data.delivery_status ?? existing.delivery_status;

    if (
      !delivery_address ||
      delivery_address.trim().length === 0
    ) {
      throw new BadRequestException(
        'Delivery address is required',
      );
    }

    const allowedStatuses = [
      'Pending',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(delivery_status)) {
      throw new BadRequestException('Invalid delivery status');
    }

    await this.db.getPool().execute(
      `UPDATE delivery
       SET delivery_address = ?,
           delivery_status = ?
       WHERE delivery_id = ?`,
      [delivery_address.trim(), delivery_status, id],
    );

    return {
      message: 'Delivery updated successfully',
      delivery_id: id,
      delivery_address: delivery_address.trim(),
      delivery_status,
    };
  }

  async delete(id: number) {
    await this.getById(id);

    await this.db.getPool().execute(
      'DELETE FROM delivery WHERE delivery_id = ?',
      [id],
    );

    return {
      message: 'Delivery deleted successfully',
    };
  }
}
