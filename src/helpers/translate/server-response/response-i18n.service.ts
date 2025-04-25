import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PageDto } from 'src/helpers/pagination/page-dto/page-dto';
import { PageMetaDto } from 'src/helpers/pagination/page-meta-dto/page-meta-dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { I18nPath } from '../generated/i18n.generated';
import { TranslateService } from '../translate.service';
import {
  OtherKeyUnion,
  EntityKey,
  FieldKey,
  ResponseData,
  ErrorParams,
  ApiResponse,
} from '../types/i18n.types';

@Injectable()
export class ResponseI18nService {
  private message: any;
  private defaultMessage: any;
  constructor(private readonly i18nService: TranslateService) {}

  // General message
  private translateMessage(key: I18nPath, args: Record<string, any> = {}) {
    return this.i18nService.translate(key, { args });
  }

  // Other message
  private translateOtherMessage(
    key: OtherKeyUnion,
    args: Record<string, any> = {},
  ) {
    return this.i18nService.translate(
      `otherMessage.${String(key)}` as I18nPath,
      {
        args,
      },
    );
  }

  // Entity message
  private translateEntity(key: EntityKey) {
    return this.translateMessage(
      `collection.ENTITY.${String(key)}` as I18nPath,
    );
  }

  // Field message
  private translateField(key: FieldKey) {
    return this.translateMessage(`collection.FIELD.${String(key)}` as I18nPath);
  }

  success<T>(data: T, entityKey: EntityKey): ResponseData<T> {
    this.message = this.translateMessage('global.CRUD.READ.SUCCESS', {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Operation successful',
      data,
    };
  }

  // Fetch with pagination
  fetchWithPagination<T>(
    data: T[],
    itemCount: number,
    pageOptionsDto: PageOptionsDto,
    entityKey: EntityKey,
  ): PageDto<T> {
    const hasData = data && data.length > 0;

    this.message = hasData
      ? this.translateMessage('global.CRUD.READ.SUCCESS', {
          entity: this.translateEntity(entityKey),
        })
      : this.translateMessage('global.CRUD.READ.NOT_FOUND', {
          entity: this.translateEntity(entityKey),
        }) || 'No data available';

    return {
      statusCode: hasData ? HttpStatus.OK : HttpStatus.NO_CONTENT,
      message: this.message || 'Data fetched successfully',
      data,
      meta: new PageMetaDto({
        pageOptionsDto,
        itemCount,
      }),
    };
  }

  // Fetch without pagination
  fetchAll<T>(data: T[], entityKey: EntityKey): ApiResponse<T> {
    // console.log('Checking `this` in fetchAll:', this);
    // if (!this || !this.translateMessage) {
    //   throw new Error('ResponseI18nService is not properly initialized.');
    // }

    const hasData = Array.isArray(data) && data.length > 0;
    const count = hasData ? data.length : 0;

    this.message = hasData
      ? this.translateMessage('global.CRUD.READ.SUCCESS', {
          entity: this.translateEntity(entityKey),
        })
      : this.translateMessage('global.CRUD.READ.NOT_FOUND', {
          entity: this.translateEntity(entityKey),
        }) || 'No data available';

    return {
      statusCode: hasData ? HttpStatus.OK : HttpStatus.NO_CONTENT,
      message: this.message,
      count,
      data: hasData ? data : [],
    };
  }

  create<T>(data: T, entityKey: EntityKey): ResponseData<T> {
    this.message = this.translateMessage('global.CRUD.CREATE.SUCCESS', {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: this.message || 'Entity created successfully',
      data,
    };
  }

  // Update response
  update<T>(data: T, entityKey: EntityKey): ResponseData<T> {
    this.message = this.i18nService.translate('global.CRUD.UPDATE.SUCCESS', {
      args: { entity: entityKey },
    });
    this.message = this.translateMessage('global.CRUD.UPDATE.SUCCESS', {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.OK,
      message: this.message || 'Entity updated successfully',
      data,
    };
  }

  // Delete response
  delete<T>(data: T, entityKey: EntityKey): ResponseData<T> {
    this.message = this.translateMessage('global.CRUD.DELETE.SUCCESS', {
      entity: this.translateEntity(entityKey),
    });

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: this.message || 'Entity deleted successfully',
      data,
    };
  }

  // Not Found data
  notFound(entityKey: EntityKey): ResponseData<null> {
    this.message = this.translateMessage('global.ERRORS.INVALID_DATA', {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: this.message || 'Resource not found',
      data: null,
    };
  }

  // Conflict error response
  conflict(field: string, value: string): ResponseData<null> {
    this.message = this.translateMessage('global.ERRORS.CONFLICT', {
      args: { field, value },
    });
    return {
      statusCode: HttpStatus.CONFLICT,
      message: this.message || 'Conflict occurred',
    };
  }

  // Bad Request response
  validationError({ key, fieldName }: ErrorParams) {
    this.message = this.translateMessage(
      `global.ERRORS.VALIDATION_ERROR.${String(key)}` as I18nPath,
      {
        field: this.translateField(fieldName),
      },
    );
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: this.message || 'Invalid input',
    };
  }

  // Other message
  otherMessage(key: OtherKeyUnion, args: Record<string, any> = {}) {
    return this.translateOtherMessage(key, args);
  }

  // Bad Request
  badRequest(key: OtherKeyUnion, entityKey?: EntityKey): ResponseData<any> {
    this.message = this.translateOtherMessage(key, {
      entity: this.translateEntity(entityKey),
    });
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: this.message,
    };
  }

  // Handle error
  handleError = (error: any): never => {
    // Validation Error
    if (error.name === 'ValidationError') {
      this.message = this.translateMessage('global.ERRORS.VALIDATION_ERROR', {
        message: error.message || 'Validation error occurred.',
      });
      throw new HttpException(
        this.message || 'Validation error occurred.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Duplicate Key Error
    if (error.code === 11000) {
      const keyValue = error.keyValue || {};
      const field = Object.keys(keyValue).join(', ') || 'unknown field';
      const value = Object.values(keyValue).join(', ') || 'unknown value';

      this.message = this.translateMessage('global.ERRORS.CONFLICT', {
        field: this.translateField(field as FieldKey),
        value,
      });

      throw new HttpException(this.message || 'Conflict', HttpStatus.CONFLICT);
    }

    // Resource Not Found
    if (
      error.status === HttpStatus.NOT_FOUND ||
      error.message?.includes('not found')
    ) {
      const entityName = error.entity || 'Resource';
      this.message = this.translateMessage('global.ERRORS.INVALID_DATA', {
        entity: entityName,
      });

      throw new HttpException(
        this.message || `${entityName} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (error.code === 'ECONNRESET') {
      this.message = this.translateMessage(
        'global.ERRORS.CONNECTION_RESET',
        {},
      );

      throw new HttpException(
        this.message || 'The connection was reset. Please try again.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Service Unavailable (Generic)
    if (error.status === HttpStatus.SERVICE_UNAVAILABLE) {
      this.message = this.translateMessage(
        'global.ERRORS.SERVICE_UNAVAILABLE',
        {},
      );

      throw new HttpException(
        this.message ||
          'The service is temporarily unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Database Connection Error (MongoDB Issues)
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError'
    ) {
      this.message = this.translateMessage('global.ERRORS.CONNECTION', {});

      throw new HttpException(
        this.message || 'Database connection error. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Invalid Object ID Format
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      this.message = this.translateMessage('global.ERRORS.INVALID_ID', {
        id: error.value,
      });

      throw new HttpException(
        this.message || 'Invalid ID format.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Unauthorized Access
    if (error.status === HttpStatus.UNAUTHORIZED) {
      this.message = this.translateMessage('global.ERRORS.UNAUTHORIZED', {});

      throw new HttpException(
        this.message || 'Unauthorized access.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Forbidden Access
    if (error.status === HttpStatus.FORBIDDEN) {
      this.message = this.translateMessage('global.ERRORS.FORBIDDEN');

      throw new HttpException(
        this.message || 'Forbidden access.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Default Unexpected Error
    this.defaultMessage = this.translateMessage(
      'global.ERRORS.VALIDATION_ERROR.UNEXPECTED',
      {
        message: error.message || 'No error message provided',
      },
    );

    throw new HttpException(
      this.defaultMessage || 'An unexpected error occurred.',
      error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  };
}
