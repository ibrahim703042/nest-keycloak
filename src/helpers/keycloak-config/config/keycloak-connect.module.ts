import { Global, Module } from '@nestjs/common';
import { KeycloakConnectorService } from './keycloak-connect.service';
import { KeycloakConfigService } from './keycloak-config.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('KEYCLOAK_SERVER_URL'),
        timeout: configService.get('HTTP_TIMEOUT') || 120000,
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS') || 6,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [KeycloakConnectorService, KeycloakConfigService],
  exports: [HttpModule, KeycloakConnectorService, KeycloakConfigService],
})
export class KeycloakConnectorModule {}
