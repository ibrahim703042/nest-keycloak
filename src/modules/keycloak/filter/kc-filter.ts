import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FilterClientDto {
  @ApiProperty({
    description: 'ID of the client',
    example: 'clientId',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;
}
