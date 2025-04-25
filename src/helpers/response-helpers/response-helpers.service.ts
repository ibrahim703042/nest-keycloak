import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginationData, ResponseData } from './utils';
import { PageMetaDto } from '../pagination/page-meta-dto/page-meta-dto';
import { PageDto } from '../pagination/page-dto/page-dto';
import { PageOptionsDto } from '../pagination/page-options-dto/page-options-dto';

@Injectable()
export class ResponseHelpersService {
  success<T>(data: T, message?: string): ResponseData<T> {
    return {
      statusCode: HttpStatus.OK,
      message: message || 'Success',
      data,
    };
  }

  fetchWithPagination<T>(
    data: T[],
    itemCount: number,
    pageOptionsDto: PageOptionsDto,
    message?: string,
  ): PageDto<T> {
    return {
      statusCode: HttpStatus.OK,
      message: message || 'Operation successful',
      data,
      meta: new PageMetaDto({
        pageOptionsDto,
        itemCount,
      }),
    };
  }

  create<T>(data: T, message?: string): ResponseData<T> {
    return {
      statusCode: HttpStatus.CREATED,
      message: message || 'Created Successfully',
      data,
    };
  }

  error(message: string, errors?: Error[]): ResponseData<any> {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errors,
    };
  }

  notFound(message?: string): ResponseData<any> {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: message || 'Not Found',
    };
  }

  conflict(message?: string): ResponseData<any> {
    return {
      statusCode: HttpStatus.CONFLICT,
      message: message || 'Conflict',
    };
  }

  pagination<T>(
    data: T[],
    total: number,
    limit: number = 10,
    page: number = 0,
    pageSize: number,
  ): ResponseData<PaginationData<T>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        content: data,
        total,
        limit,
        page,
        pageSize,
      },
    };
  }

  update<T>(data: T, message?: string): ResponseData<T> {
    return {
      statusCode: HttpStatus.OK,
      message: message || 'Updated Successfully',
      data,
    };
  }

  delete<T>(data: T, message?: string): ResponseData<T> {
    return {
      statusCode: HttpStatus.OK,
      message: message || 'Deleted Successfully',
      data,
    };
  }

  badRequest(message?: string): ResponseData<any> {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: message || 'Bad Request',
    };
  }

  handleError = (error: any): never => {
    if (error.name === 'ValidationError') {
      throw new HttpException(
        `Validation error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (error.code === 11000) {
      const keyValue = error.keyValue || {};
      const field = Object.keys(keyValue).join(', ') || 'unknown field';
      const value = Object.values(keyValue).join(', ') || 'unknown value';
      throw new HttpException(
        `The field '${field}' with value '${value}' already exists.`,
        HttpStatus.CONFLICT,
      );
    }

    if (
      error.status === HttpStatus.NOT_FOUND ||
      error.message?.includes('not found')
    ) {
      throw new HttpException(
        error.message || 'The requested resource was not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Database Connection Error
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError'
    ) {
      throw new HttpException(
        'Failed to connect to the database. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      throw new HttpException(
        `Invalid ID format: ${error.value}. Please provide a valid ID.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Unauthorized Access Error
    if (error.status === HttpStatus.UNAUTHORIZED) {
      throw new HttpException(
        error.message || 'You are not authorized to perform this action.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Forbidden Access Error
    if (error.status === HttpStatus.FORBIDDEN) {
      throw new HttpException(
        error.message || 'You do not have permission to perform this action.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Default Case for Unexpected Errors
    throw new HttpException(
      `${error.message || 'No error message provided'}`,
      error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  };
}

export const handleError = (error: any): never => {
  if (error.name === 'ValidationError') {
    throw new HttpException(
      `Validation error: ${error.message}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (error.code === 11000) {
    const keyValue = error.keyValue || {};
    const field = Object.keys(keyValue).join(', ') || 'unknown field';
    const value = Object.values(keyValue).join(', ') || 'unknown value';
    throw new HttpException(
      `The field '${field}' with value '${value}' already exists.`,
      HttpStatus.CONFLICT,
    );
  }

  if (
    error.status === HttpStatus.NOT_FOUND ||
    error.message?.includes('not found')
  ) {
    throw new HttpException(
      error.message || 'The requested resource was not found.',
      HttpStatus.NOT_FOUND,
    );
  }

  // Database Connection Error
  if (
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError'
  ) {
    throw new HttpException(
      'Failed to connect to the database. Please try again later.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    throw new HttpException(
      `Invalid ID format: ${error.value}. Please provide a valid ID.`,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Unauthorized Access Error
  if (error.status === HttpStatus.UNAUTHORIZED) {
    throw new HttpException(
      error.message || 'You are not authorized to perform this action.',
      HttpStatus.UNAUTHORIZED,
    );
  }

  // Forbidden Access Error
  if (error.status === HttpStatus.FORBIDDEN) {
    throw new HttpException(
      error.message || 'You do not have permission to perform this action.',
      HttpStatus.FORBIDDEN,
    );
  }

  // Default Case for Unexpected Errors
  throw new HttpException(
    `An unexpected error occurred: ${error.message || 'No error message provided'}`,
    error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
