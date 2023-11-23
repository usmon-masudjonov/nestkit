import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService): GoogleStrategy | null => {
        if (configService.get<string>('ENABLE_GOOGLE_OAUTH') === 'yes') {
          return new GoogleStrategy(configService);
        }
        return null;
      },
      inject: [ConfigService],
    },
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
