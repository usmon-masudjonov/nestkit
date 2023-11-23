import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './core/infra/filters/allExceptionFilter';
import { LoggerService } from './core/infra/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './core/infra/interceptors/responseInterceptor';

async function bootstrap(): Promise<void> {
  const configService = new ConfigService();
  const logger = new LoggerService(configService);

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const appPort: number = configService.getOrThrow<number>('APP_PORT');

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, logger));
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (configService.getOrThrow<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(appPort, () => {
    console.log('Server is running on port', appPort);
  });
}

bootstrap();
