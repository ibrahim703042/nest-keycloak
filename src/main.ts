import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { join } from 'path';
import mongoose from 'mongoose';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MonitoringInterceptor } from './helpers/monitoring/monitoring.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GrpcExceptionFilter } from './grpc/exception/grpc-exception.filter';
import { swaggerConfiguration } from './helpers/swagger/swagger';

async function bootstrap() {
  const PORT = process.env.PORT || 3019;
  const app = await NestFactory.create(AppModule);
  const loggerInstance = new Logger('Bootstrap');
  const corsOptions: CorsOptions = {
    origin: '*',
    methods: '*',
    credentials: true,
  };

  swaggerConfiguration(app);
  mongoose.set('strictPopulate', false);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalInterceptors(new MonitoringInterceptor());
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.setGlobalPrefix(process.env.URL_PREFIX || 'api');
  app.enableCors(corsOptions);
  app.use(json({ limit: '50mb' }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: 'localhost:10010',
      package: 'package.fiscalYear',
      protoPath: join(__dirname, 'grpc/proto/fiscal-year.proto'),
    },
  });

  app.startAllMicroservices();

  await app.listen(PORT, () => {
    console.log('Port is listening on :', PORT);
    // swaggerLogger(loggerInstance);
  });
}

bootstrap();
