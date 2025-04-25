import { Global, Module } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TranslateInterceptor } from './translate.interceptor';
import {
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import path from 'path';
import { ResponseI18nService } from './server-response/response-i18n.service';
import { KcI18nService } from './server-response/kc-i18n-response.service';

const i18nPath = path.join(__dirname, '../../helpers/translate');
const typeSafety = path.join(
  __dirname,
  '../../../src/helpers/translate/generated/i18n.generated.ts',
);

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: i18nPath,
        watch: true,
      },
      typesOutputPath: typeSafety,
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
  ],
  providers: [
    TranslateService,
    KcI18nService,
    ResponseI18nService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslateInterceptor,
    },
  ],
  exports: [TranslateService, ResponseI18nService, KcI18nService],
})
export class TranslateModule {}
