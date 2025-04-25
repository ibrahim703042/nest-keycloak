import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString } from 'class-validator';

export class ResponseData<T> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: Error[];
}

export interface PaginationData<T> {
  content: T[];
  total: number;
  limit: number;
  page: number;
  pageSize: number;
}

export class ResponsePaginateDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  readonly limit?: number = 10;
}

export class ResponseStorePaginateDto extends ResponsePaginateDto {
  @ApiProperty()
  @IsMongoId()
  readonly storeId: string;
}

export class ResponsePaginateBycountryDto extends ResponsePaginateDto {
  @ApiProperty()
  @IsMongoId()
  readonly country: string;
}

export class ErrorDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  field?: string;
}

export class ResponseDataDto<T> {
  @ApiPropertyOptional({ description: 'HTTP status code of the response' })
  @IsNumber()
  statusCode: number;

  @ApiPropertyOptional({
    description: 'Description of the result or outcome of the operation',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'The payload or data associated with the response',
    type: Object,
  })
  @IsObject()
  @IsOptional()
  data?: T;
}

export class DataPagination<T> {
  @ApiPropertyOptional({ description: 'Data of the response', type: Object })
  content: T[];

  @ApiPropertyOptional({ description: 'Total of the response', type: Number })
  total: number;

  @ApiPropertyOptional({ description: 'Limit of the response', type: Number })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Page of the response', type: Number })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size of the response',
    type: Number,
  })
  pageSize: number;
}

export class ResponseDataPagianationDto<DataPagination> {
  @ApiPropertyOptional({ description: 'HTTP status code of the response' })
  statusCode: number;

  @ApiPropertyOptional({
    description: 'Description of the result or outcome of the operation',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'The payload or data associated with the response',
    type: DataPagination,
  })
  data: DataPagination;
}

export class ResponseDataDTO<T> {
  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description:
      'Descriptive message providing more details about the response',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The actual data returned by the API, could be of any type',
    example: {},
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'List of errors, if any occurred during the request handling',
    example: [{ message: 'Invalid input data', field: 'name' }],
    required: false,
    type: [Object], // Assuming errors are in a structured format, you can define a more specific type if necessary
  })
  errors?: Error[];
}
