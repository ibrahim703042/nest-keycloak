import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enumerations.enum';
import { IsEnum } from 'class-validator';

export class FilterRoleDto {
  @ApiProperty({
    example: UserRole.ADMIN,
    description: 'Family type for filtering categories',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: string;
}
