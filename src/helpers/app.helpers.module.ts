import { Global, Module } from '@nestjs/common';
import { AppHelperService } from './app.helper.service';
import { TranslateModule } from './translate/translate.module';
import { ResponseHelpersModule } from './response-helpers/response-helpers.module';
import { KeyCloakServerModule } from './keycloak-config/keycloak.server.module';

@Global()
@Module({
  imports: [TranslateModule, ResponseHelpersModule, KeyCloakServerModule],
  providers: [AppHelperService],
  exports: [AppHelperService],
})
export class AppHelpersModule {}
