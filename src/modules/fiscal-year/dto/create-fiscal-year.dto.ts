import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { StatusType } from 'src/utils/enum/enumerations.enum';

export class CreateFiscalYearDto {
  @ApiProperty({
    example: 'Fiscal Year 2024',
    description: 'The name of the fiscal year',
  })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date of the fiscal year',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'End date of the fiscal year',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
