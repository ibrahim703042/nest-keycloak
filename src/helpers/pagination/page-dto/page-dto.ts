import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMetaDto } from '../page-meta-dto/page-meta-dto';

export class PageDto<T> {
  @ApiProperty({ example: 200, required: false })
  readonly statusCode: number;

  @ApiProperty({ example: 'Operation successful', required: false })
  readonly message: string;

  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(
    data: T[],
    meta: PageMetaDto,
    statusCode: number = 200,
    message: string = 'Operation successful',
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
