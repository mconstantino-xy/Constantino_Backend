
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() body: {
      username?: string;
      password?: string;
    },
  ) {
    const username =
      typeof body?.username === 'string'
        ? body.username.trim()
        : '';

    const password =
      typeof body?.password === 'string'
        ? body.password
        : '';

    if (!username || !password) {
      throw new BadRequestException(
        'Username and password are required.',
      );
    }

    return this.usersService.createUser(username, password);
  }

  @Post('login')
  async login(
    @Body() body: {
      username?: string;
      password?: string;
    },
  ) {
    const username =
      typeof body?.username === 'string'
        ? body.username.trim()
        : '';

    const password =
      typeof body?.password === 'string'
        ? body.password
        : '';

    if (!username || !password) {
      throw new BadRequestException(
        'Username and password are required.',
      );
    }

    const user = await this.authService.validateUser(
      username,
      password,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Account not found. Please sign up first to create an account.',
      );
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(
    @Body() body: {
      refreshToken?: string;
    },
  ) {
    if (
      typeof body?.refreshToken !== 'string' ||
      !body.refreshToken
    ) {
      throw new BadRequestException(
        'Refresh token is required.',
      );
    }

    return this.authService.refreshTokens(
      body.refreshToken,
    );
  }
}
