import { Global, Module } from '@nestjs/common';
import { StoreClientController } from './controllers/store-client.controller';
import { UserGrpcApiController } from './controllers/user-grpc-api.controller';
import { FiscalYearGrpcApiController } from './controllers/fiscal-year-grpc-api.controller';
import { StoreClientService } from './services/store-client.service';
import { VatClientService } from './services/vta-client.service';
import { VatClientController } from './controllers/tva-client.controller';

@Global()
@Module({
  imports: [],
  controllers: [
    StoreClientController,
    VatClientController,
    FiscalYearGrpcApiController,
    UserGrpcApiController,
  ],
  providers: [StoreClientService, VatClientService],
  exports: [StoreClientService, VatClientService],
})
export class ExternalModule {}
