import { Global, Module } from '@nestjs/common';
import { KeycloakAuthService } from './keycloak-auth.service';
import { KeycloakConnectorModule } from './config/keycloak-connect.module';

@Global()
@Module({
  imports: [KeycloakConnectorModule],
  providers: [KeycloakAuthService],
  exports: [KeycloakAuthService],
})
export class KeyCloakServerModule {}
