import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { DatabasesModule } from './databases/databases.module';

@Module({
  imports: [LoggerModule, DatabasesModule],
})
export class InfraModule {}
