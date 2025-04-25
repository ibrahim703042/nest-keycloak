import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHelpersModule } from './helpers/response-helpers/response-helpers.module';
import { SocieteModule } from './modules/organization/societe.module';
import { ExternalApiModule } from './utils/circuit-breaker/external-api.module';
import { AppHelpersModule } from './helpers/app.helpers.module';
import { EnumTypeController } from './utils/enum/controller/utils.contoller';
import { KeycloakManagementModule } from './modules/keycloak/keycloak-management.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserInfoModule } from './modules/user-info/user-info.module';
import { GrpcClientsModule } from './grpc/grpc-clients.module';
import { FiscalYearModule } from './modules/fiscal-year/fiscal-year.module';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads') }),
    AppHelpersModule,
    GrpcClientsModule,
    KeycloakManagementModule,
    UserInfoModule,
    FiscalYearModule,
    SocieteModule,
    ExternalApiModule,
    ResponseHelpersModule,
  ],

  controllers: [EnumTypeController],
  providers: [],
})
export class AppModule {}
