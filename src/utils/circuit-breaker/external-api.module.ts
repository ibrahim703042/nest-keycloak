import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExternalApiService } from './external-api.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_STOCK',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('TCP_STOCK_HOST'),
            port: configService.get<number>('TCP_STOCK_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'SERVICE_COMMANDE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('TCP_COMMANDE_HOST'),
            port: configService.get<number>('TCP_COMMANDE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}
