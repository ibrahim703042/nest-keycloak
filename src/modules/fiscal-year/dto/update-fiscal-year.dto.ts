import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { CreateFiscalYearDto } from './create-fiscal-year.dto';
import { IsEnum } from 'class-validator';
import { StatusType } from 'src/utils/enum/enumerations.enum';

export class UpdateFiscalYearDto extends PartialType(CreateFiscalYearDto) {
  @ApiProperty({
    example: StatusType.ACTIVE,
    description: 'Status of the fiscal year',
    enum: StatusType,
  })
  @IsEnum(StatusType)
  status: StatusType;
}

export class UpdateFiscalYearStatusDto extends PickType(UpdateFiscalYearDto, [
  'status',
] as const) {}
