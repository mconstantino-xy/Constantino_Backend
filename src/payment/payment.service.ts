
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

  // GET ALL PAYMENTS
  async getAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        p.payment_id,
        p.order_id,
        p.payment_method,
        p.amount,
        p.payment_status,
        p.payment_date
      FROM payment p
      ORDER BY p.payment_id DESC`,
    );

    return rows;
  }

  // GET PAYMENT BY ID
  async getById(id: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        payment_id,
        order_id,
        payment_method,
        amount,
        payment_status,
        payment_date
      FROM payment
      WHERE payment_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Payment not found');
    }

    return rows[0];
  }

  // CREATE PAYMENT
  async create(data: {
    order_id: number;
    payment_method: string;
    amount: number;
    payment_status?: string;
  }) {
    const {
      order_id,
      payment_method,
      amount,
      payment_status,
    } = data;

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const [orders] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT order_id FROM orders WHERE order_id = ?',
      [order_id],
    );

    if (orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const [existingPayments] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(
        'SELECT payment_id FROM payment WHERE order_id = ?',
        [order_id],
      );

    if (existingPayments.length > 0) {
      throw new BadRequestException(
        'A payment record already exists for this order',
      );
    }

    const allowedMethods = [
      'Cash',
      'GCash',
      'Credit Card',
      'Debit Card',
    ];

    if (!allowedMethods.includes(payment_method)) {
      throw new BadRequestException('Invalid payment method');
    }

    const status = payment_status || 'Pending';

    const allowedStatuses = ['Pending', 'Paid', 'Failed'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid payment status');
    }

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO payment
       (order_id, payment_method, amount, payment_status)
       VALUES (?, ?, ?, ?)`,
      [order_id, payment_method, Number(amount), status],
    );

    return {
      message: 'Payment created successfully',
      payment_id: result.insertId,
      order_id,
      payment_method,
      amount: Number(amount),
      payment_status: status,
    };
  }

  // UPDATE PAYMENT
  async update(
    id: number,
    data: {
      payment_method?: string;
      amount?: number;
      payment_status?: string;
    },
  ) {
    const existing = await this.getById(id);

    const payment_method =
      data.payment_method ?? existing.payment_method;

    const amount =
      data.amount ?? Number(existing.amount);

    const payment_status =
      data.payment_status ?? existing.payment_status;

    const allowedMethods = [
      'Cash',
      'GCash',
      'Credit Card',
      'Debit Card',
    ];

    const allowedStatuses = ['Pending', 'Paid', 'Failed'];

    if (!allowedMethods.includes(payment_method)) {
      throw new BadRequestException('Invalid payment method');
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (!allowedStatuses.includes(payment_status)) {
      throw new BadRequestException('Invalid payment status');
    }

    await this.db.getPool().execute(
      `UPDATE payment
       SET payment_method = ?,
           amount = ?,
           payment_status = ?
       WHERE payment_id = ?`,
      [payment_method, Number(amount), payment_status, id],
    );

    return {
      message: 'Payment updated successfully',
      payment_id: id,
      payment_method,
      amount: Number(amount),
      payment_status,
    };
  }

  // DELETE PAYMENT
  async delete(id: number) {
    await this.getById(id);

    await this.db.getPool().execute(
      'DELETE FROM payment WHERE payment_id = ?',
      [id],
    );

    return {
      message: 'Payment deleted successfully',
    };
  }
}
