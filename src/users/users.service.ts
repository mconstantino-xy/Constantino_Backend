
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createUser(username: string, password: string) {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      throw new ConflictException(
        'Username and password are required.',
      );
    }

    const [existingUsers] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ?',
      [cleanUsername],
    );

    if (existingUsers.length > 0) {
      throw new ConflictException(
        'Username already exists. Please try another one.',
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const role = 'user';

    try {
      const [result] = await this.pool().execute<OkPacket>(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [cleanUsername, hashed, role],
      );

      return {
        id: result.insertId,
        username: cleanUsername,
        role,
        message: 'Account created successfully. You can now sign in.',
      };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Username already exists. Please try another one.',
        );
      }

      throw error;
    }
  }

  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, password, role, refresh_token FROM users WHERE username = ?',
      [username],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE id = ?',
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users',
    );

    return rows;
  }

  async updateUser(
    id: number,
    partial: {
      username?: string;
      password?: string;
      role?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username.trim());
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteUser(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE id = ?',
      [id],
    );

    return res.affectedRows > 0;
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }

  async setRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    await this.pool().execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId],
    );

    return true;
  }
}
