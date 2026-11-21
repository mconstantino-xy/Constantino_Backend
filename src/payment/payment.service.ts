
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

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

  // CUSTOMER AND ADMIN: Get payment using order ID
  async getByOrderForUser(
    orderId: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const [orders] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT user_id FROM orders WHERE order_id = ?',
      [orderId],
    );

    if (orders.length === 0) {
      throw new NotFoundException('Order not found');
    }

    if (
      !isAdmin &&
      Number(orders[0].user_id) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You can only access your own payment',
      );
    }

    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        payment_id,
        order_id,
        payment_method,
        amount,
        payment_status,
        payment_date
      FROM payment
      WHERE order_id = ?
      LIMIT 1`,
      [orderId],
    );

    return rows[0] ?? null;
  }

  async getByIdForUser(
    id: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      `SELECT
        p.payment_id,
        p.order_id,
        p.payment_method,
        p.amount,
        p.payment_status,
        p.payment_date,
        o.user_id
      FROM payment p
      INNER JOIN orders o ON p.order_id = o.order_id
      WHERE p.payment_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Payment not found');
    }

    if (
      !isAdmin &&
      Number(rows[0].user_id) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You can only access your own payment',
      );
    }

    const { user_id, ...payment } = rows[0];
    return payment;
  }

  async create(
    data: {
      order_id: number;
      payment_method: string;
    },
    userId: number,
    isAdmin: boolean,
  ) {
    const { order_id, payment_method } = data;

    const [orders] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT user_id, total_amount FROM orders WHERE order_id = ?',
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
        'You can only pay for your own order',
      );
    }

    const amount = Number(orders[0].total_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Order total must be greater than zero',
      );
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

    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO payment
       (order_id, payment_method, amount, payment_status)
       VALUES (?, ?, ?, ?)`,
      [order_id, payment_method, amount, 'Pending'],
    );

    return {
      message: 'Payment created successfully',
      payment_id: result.insertId,
      order_id,
      payment_method,
      amount,
      payment_status: 'Pending',
    };
  }

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
      throw new BadRequestException(
        'Amount must be greater than zero',
      );
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
