import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as fs from 'fs';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nPath, I18nTranslations } from './generated/i18n.generated';

export type SupportedLang = 'en' | 'fr';
export const defaultLang: SupportedLang = 'en';

@Injectable({ scope: Scope.REQUEST })
export class TranslateService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  t(key: string): string {
    // const lang = this.request?.headers['accept-language'] || 'en';
    const lang = this.lang();
    try {
      const data = fs.readFileSync(`src/helpers/translate/${lang}.json`, {
        encoding: 'utf-8',
      });
      const i18n = JSON.parse(data);
      return i18n[key] || key;
    } catch (error) {
      console.log(error);
      return key;
    }
  }

  translate(key: I18nPath, options?: Record<string, any>) {
    const lang = this.lang();
    return this.i18nService.translate(key, { lang, ...options });
  }

  lang(): SupportedLang {
    return (I18nContext.current()?.lang || defaultLang) as SupportedLang;
  }
}
