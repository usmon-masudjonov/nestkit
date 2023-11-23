import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleProfile } from './strategies/types/google';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDTO } from './dtos/registerDTO';
import { LoginDTO } from './dtos/loginDTO';
import { ConfirmDTO } from './dtos/confirmDTO';
import { TokensDTO } from './dtos/tokensDTO';
import { REDIS } from 'src/core/infra/databases/redis/constants/redis';
import { Redis } from 'ioredis';
import { AUTH_RELATED_REDIS_KEYS } from './constants/authRelatedRedisKeys';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/types/user';
import { generateRandomCode } from 'src/common/utils/randomCodeGenerator';
import { OTP_CODE_EXPIRES_IN } from './constants/otpCodes';
import { SALTS_ROUND } from './constants/bcrypt';
import { isEmail } from 'class-validator';
import { AccessTokenPayload, RefreshTokenPayload } from './types/tokens';
import { v4 as uuid } from 'uuid';
import { Request } from 'src/core/infra/types/request';
import { RefreshTokenDTO } from './dtos/refreshTokenDTO';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private generateAccessToken(user: User): Promise<string> {
    const payload: AccessTokenPayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      login: user.login,
    };

    return this.jwtService.signAsync(payload);
  }

  private generateRefreshToken(user: User): Promise<string> {
    const payload: RefreshTokenPayload = {
      id: user.id,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  async googleAuthCallback(profile: GoogleProfile): Promise<TokensDTO> {
    const user: User | null = await this.usersService.getUserByLogin(
      profile._json.email,
    );

    if (!user) {
      const defaultLogin: string = uuid().replaceAll('-', '');

      const createUser: User = await this.usersService.createUser({
        email: profile._json.email,
        first_name: profile._json.given_name,
        last_name: profile._json.family_name,
        login: defaultLogin,
        password: null,
        is_verified: true,
      });

      await this.redis.sadd(
        `${AUTH_RELATED_REDIS_KEYS.occupiedLogins}`,
        defaultLogin,
      );

      await this.redis.sadd(
        `${AUTH_RELATED_REDIS_KEYS.occupiedEmails}`,
        profile._json.email,
      );

      return {
        accessToken: await this.generateAccessToken(createUser),
        refreshToken: await this.generateRefreshToken(createUser),
      };
    } else if (!user.is_verified) {
      await this.usersService.makeUserVerified(user.id);
    }

    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  async isLoginOccupied(login: string): Promise<boolean> {
    const result: number = await this.redis.sismember(
      AUTH_RELATED_REDIS_KEYS.occupiedLogins,
      login,
    );
    return result === 1;
  }

  async isEmailOccupied(email: string): Promise<boolean> {
    const result: number = await this.redis.sismember(
      AUTH_RELATED_REDIS_KEYS.occupiedEmails,
      email,
    );
    return result === 1;
  }

  async register(data: RegisterDTO): Promise<void> {
    if (await this.isLoginOccupied(data.login)) {
      throw new ConflictException('Login already occupied');
    }

    if (await this.isEmailOccupied(data.email)) {
      throw new ConflictException('Email already occupied');
    }

    const user: User = await this.usersService.createUser({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      login: data.login,
      password: await bcrypt.hash(data.password, SALTS_ROUND),
      is_verified: false,
    });

    const code: number = generateRandomCode(5);

    /* TODO: You have to write a piece of code that delivers generated 
       one time password to user. It might be telegram, email or SMS.
    */

    await this.redis.sadd(
      `${AUTH_RELATED_REDIS_KEYS.occupiedLogins}`,
      data.login,
    );

    await this.redis.sadd(
      `${AUTH_RELATED_REDIS_KEYS.occupiedEmails}`,
      data.email,
    );

    await this.redis.set(
      `${AUTH_RELATED_REDIS_KEYS.otpCodes}:${user.id}`,
      code,
      'EX',
      OTP_CODE_EXPIRES_IN,
    );
  }

  async login(data: LoginDTO): Promise<TokensDTO> {
    if (isEmail(data.login)) {
      if (!(await this.isEmailOccupied(data.login))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      if (!(await this.isLoginOccupied(data.login))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const user: User | null = await this.usersService.getUserByLogin(
      data.login,
    );

    if (!user || !user.is_verified) {
      throw new UnauthorizedException('Invalid credentials');
    } else if (!(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  async confirm(data: ConfirmDTO): Promise<TokensDTO> {
    if (isEmail(data.login)) {
      if (!(await this.isEmailOccupied(data.login))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      if (!(await this.isLoginOccupied(data.login))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const user: User | null = await this.usersService.getUserByLogin(
      data.login,
    );

    if (!user) {
      throw new UnauthorizedException('Something went wrong');
    }

    const otp: number = Number(
      await this.redis.get(`${AUTH_RELATED_REDIS_KEYS.otpCodes}:${user.id}`),
    );

    if (isNaN(otp) || otp !== data.otp) {
      throw new UnauthorizedException('Invalid code');
    }

    await this.redis.del(`${AUTH_RELATED_REDIS_KEYS.otpCodes}:${user.id}`);

    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  async refreshToken(req: Request, data: RefreshTokenDTO): Promise<TokensDTO> {
    const authorization: string = req.headers.authorization;

    if (!authorization) {
      throw new BadRequestException('Invalid authorization header');
    }

    const accessToken: string = authorization.split('Bearer ')[1];

    if (!accessToken) {
      throw new NotFoundException('Access token not found');
    }

    const accessTokenPayload: AccessTokenPayload | null = await this.jwtService
      .verifyAsync(accessToken)
      .catch(() => {
        return null;
      });

    if (accessTokenPayload !== null) {
      throw new ConflictException('Access token is valid');
    }

    const refreshTokenPayload: RefreshTokenPayload = await this.jwtService
      .verifyAsync(data.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      })
      .catch(() => {
        throw new BadRequestException('Invalid refresh token');
      });

    const user: User = await this.usersService.getUserById(
      refreshTokenPayload.id,
    );

    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }
}
