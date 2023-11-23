import { Global, Module, Provider } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { KNEX } from './constants/postgres';
import * as knexConfig from 'knexfile';
import { ConfigService } from '@nestjs/config';
import { PostgresService } from './postgres.service';

const knexProvider: Provider = {
  provide: KNEX,
  useFactory(configService: ConfigService): Knex {
    return knex(knexConfig[configService.getOrThrow<string>('NODE_ENV')]);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [knexProvider, PostgresService],
  exports: [knexProvider],
})
export class PostgresModule {}
