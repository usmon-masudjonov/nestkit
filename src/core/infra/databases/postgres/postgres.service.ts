import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { KNEX } from './constants/postgres';
import { Knex } from 'knex';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class PostgresService implements OnModuleInit {
  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.knex.raw('SELECT 1;');

      this.logger.debug(
        'Postgres connected successfully',
        this.constructor.name,
      );
    } catch (error) {
      this.logger.error(
        `Postgres connection refused [${error.message}]`,
        this.constructor.name,
        error.stack,
      );
    }
  }
}
