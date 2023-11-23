import { Global, Module, Provider } from '@nestjs/common';
import { REDIS } from './constants/redis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

const redisProvider: Provider = {
  provide: REDIS,
  useFactory: (configService: ConfigService): Redis => {
    return new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: Number(configService.get<string>('REDIS_PORT')),
    });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
