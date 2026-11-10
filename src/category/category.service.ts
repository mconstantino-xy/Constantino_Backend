
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class CategoryService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async getAll() {
    const [rows] = await this.db
      .getPool()
      .execute<RowDataPacket[]>(
        'SELECT * FROM category',
      );

    return rows;
  }
}
