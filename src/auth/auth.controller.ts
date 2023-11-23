import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request } from 'src/core/infra/types/request';
import { GoogleProfile } from './strategies/types/google';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from './dtos/registerDTO';
import { LoginDTO } from './dtos/loginDTO';
import { ConfirmDTO } from './dtos/confirmDTO';
import { TokensDTO } from './dtos/tokensDTO';
import { RefreshTokenDTO } from './dtos/refreshTokenDTO';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request<GoogleProfile>,
  ): Promise<TokensDTO> {
    return this.service.googleAuthCallback(req.user);
  }

  @Post('register')
  async register(@Body() data: RegisterDTO): Promise<void> {
    await this.service.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginDTO): Promise<TokensDTO> {
    return await this.service.login(data);
  }

  @Post('confirm')
  async confirm(@Body() data: ConfirmDTO): Promise<TokensDTO> {
    return await this.service.confirm(data);
  }

  @Put('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Body() data: RefreshTokenDTO,
  ): Promise<TokensDTO> {
    return await this.service.refreshToken(req, data);
  }
}
