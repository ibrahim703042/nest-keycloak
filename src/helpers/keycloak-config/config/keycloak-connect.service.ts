import { Injectable, Logger } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConnectorService implements KeycloakConnectOptionsFactory {
  private readonly logger = new Logger(KeycloakConnectorService.name);

  private baseUrl: string = process.env.KEYCLOAK_SERVER_URL ?? '';
  private realm: string = process.env.KEYCLOAK_REALM ?? '';
  private clientId: string =
    process.env.KEYCLOAK_CLIENT_ID_REGISTER_SERVICE ?? '';
  private clientSecret: string =
    process.env.KEYCLOAK_CLIENT_SECRET_REGISTER_SERVICE ?? '';

  constructor() {
    this.validateConfig();
  }

  private validateConfig() {
    const missingVars = [
      { key: 'KEYCLOAK_SERVER_URL', value: this.baseUrl },
      { key: 'KEYCLOAK_REALM', value: this.realm },
      { key: 'KEYCLOAK_CLIENT_ID_REGISTER_SERVICE', value: this.clientId },
      {
        key: 'KEYCLOAK_CLIENT_SECRET_REGISTER_SERVICE',
        value: this.clientSecret,
      },
    ].filter((env) => !env.value);

    if (missingVars.length > 0) {
      missingVars.forEach((env) =>
        this.logger.error(`Missing environment variable: ${env.key}`),
      );
      throw new Error(
        `Missing Keycloak environment variables: ${missingVars.map((env) => env.key).join(', ')}`,
      );
    }
  }

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.baseUrl,
      realm: this.realm,
      clientId: this.clientId,
      secret: this.clientSecret,
      cookieKey: 'KEYCLOAK_JWT',
      logLevels: ['verbose'],
      useNestLogger: process.env.KEYCLOAK_USE_NEST_LOGGER === 'true',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
