import { Injectable, LoggerService as ILoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger, createLogger, format, transports } from 'winston';
import { correlationIdProvider } from '../hooks/correlationId';
import { v4 as uuid } from 'uuid';

/*
  RFC5424

  0 - Emergency: system is unusable
  1 - Alert: action must be taken immediately
  2 - Critical: critical conditions
  3 - Error: error conditions
  4 - Warning: warning conditions
  5 - Notice: normal but significant condition
  6 - Informational: informational messages
  7 - Debug: debug-level messages
*/

const logLevels: { [key: string]: number } = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

@Injectable()
export class LoggerService implements ILoggerService {
  private readonly logger: Logger;

  private readonly logsDirectory: string;

  constructor(private readonly configService: ConfigService) {
    this.logsDirectory =
      this.configService.getOrThrow<string>('LOGS_DIRECTORY');

    this.logger = createLogger({
      levels: logLevels,
      level: 'debug',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss',
        }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.align(),
            format.printf((info) => {
              const correlationId: string =
                correlationIdProvider.getCorrelationId() || uuid();

              return `[${info.timestamp}] ${
                info.level
              } (${correlationId}): ${info.message.trim()} [${
                info.constructor
              }]`;
            }),
          ),
        }),
        new transports.File({
          level: 'info',
          filename: `${this.logsDirectory}/combined.log`,
          format: format.combine(
            format.printf((info) => {
              const correlationId: string =
                correlationIdProvider.getCorrelationId() || uuid();

              return JSON.stringify({ ...info, correlationId: correlationId });
            }),
          ),
        }),
        new transports.File({
          level: 'error',
          filename: `${this.logsDirectory}/error.log`,
          format: format.combine(
            format.printf((info) => {
              const correlationId: string =
                correlationIdProvider.getCorrelationId() || uuid();

              return JSON.stringify({ ...info, correlationId: correlationId });
            }),
          ),
        }),
      ],
    });
  }

  debug(message: string, constructor: string) {
    this.logger.debug(message, {
      constructor,
    });
  }

  error(message: string, constructor: string, stack: string) {
    this.logger.error(message, {
      constructor,
      stack,
    });
  }

  log(message: string, constructor: string) {
    this.logger.info(message, {
      constructor,
    });
  }

  verbose(message: string, constructor: string) {
    this.logger.verbose(message, {
      constructor,
    });
  }

  warn(message: string, constructor: string) {
    this.logger.warn(message, {
      constructor,
    });
  }
}
