import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginUser(username: string, pass: string): Promise<any> {
    if (!username || !pass) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!pass) missingFields.push('password');
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }

    const user = await this.usersRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Access token (short-lived)
      const accessTokenPayload = { username: user.username, sub: user.id };
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: '15m',
      });

      // Refresh token (long-lived)
      const refreshTokenPayload = {
        username: user.username,
        sub: user.id,
        isRefreshToken: true,
      };
      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '7d',
      });

      //Exclude password
      delete user.password;

      return {
        ...user,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }

    throw new BadRequestException('Wrong credentials.');
  }

  async createUser(
    username: string,
    password: string,
  ): Promise<User | undefined> {
    if (!username || !password) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!password) missingFields.push('password');
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }
}
