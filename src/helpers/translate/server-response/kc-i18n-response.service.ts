import { Injectable, HttpStatus } from '@nestjs/common';
import { I18nPath, I18nTranslations } from '../generated/i18n.generated';
import { TranslateService } from '../translate.service';
import { EntityKey, ResponseData } from '../types/i18n.types';

@Injectable()
export class KcI18nService {
  private message: any;
  constructor(private readonly i18nService: TranslateService) {}

  // General message
  private translateMessage(key: I18nPath, args: Record<string, any> = {}) {
    return this.i18nService.translate(key, { args });
  }

  // Entity message
  private translateEntity(key: EntityKey) {
    return this.translateMessage(
      `collection.ENTITY.${String(key)}` as I18nPath,
    );
  }

  assigned<T>(key: I18nPath, entityKey: EntityKey, data: T): ResponseData<T> {
    this.message = this.translateMessage(key, {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Operation succed',
      data: data,
    };
  }

  accountStatus<T>(
    key: I18nPath,
    entityKey: EntityKey,
    data: T,
  ): ResponseData<T> {
    this.message = this.translateMessage(key, {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Operation succed',
      data: data,
    };
  }

  password<T>(key: I18nPath, entityKey: EntityKey, data: T): ResponseData<T> {
    this.message = this.translateMessage(key, {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: this.message || 'Operation succed',
      data: data,
    };
  }

  unassigned<T>(key: I18nPath, entityKey: EntityKey): ResponseData<T> {
    this.message = this.translateMessage(key, {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: this.message || 'Operation succed',
      data: null,
    };
  }

  // Authentication: Login success
  loginSuccess(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.LOGIN.SUCCESS');
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Login successful',
      data: null,
    };
  }

  // Authentication: Login failed
  loginFailed(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.LOGIN.ERROR');
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: this.message || 'Login failed. Please check your credentials.',
      data: null,
    };
  }

  // Authentication: Logout success
  logoutSuccess(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.LOGOUT.SUCCESS');
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Logout successful',
      data: null,
    };
  }

  // Authentication: Logout failed
  logoutFailed(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.LOGOUT.ERROR');
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.message || 'Logout failed. Please try again.',
      data: null,
    };
  }

  // Authentication: Token expired
  tokenExpired(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.EXPIRED_TOKEN');
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: this.message || 'Your session has expired. Please log in again.',
      data: null,
    };
  }

  // Authentication: Forbidden access
  forbiddenAccess(): ResponseData<null> {
    this.message = this.translateMessage('global.AUTH.FORBIDDEN');
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message:
        this.message || 'You do not have permission to access this resource.',
      data: null,
    };
  }
}
