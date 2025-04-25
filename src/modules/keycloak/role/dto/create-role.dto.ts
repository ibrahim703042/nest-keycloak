import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import { UserRole } from 'src/utils/enum/enumerations.enum';

export class CreateRoleDto implements Kc_Role {
  @ApiProperty({
    example: UserRole.CASHIER,
    description: `name of the role. Allowed values are: ${Object.values(UserRole).join(', ')}.`,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Regular user',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateUserRoleMappingDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '12345678-abcd-90ef-ghij-1234567890kl',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'List of role names to assign',
    example: ['role name 1', 'role name 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleName: string[];
}

export class CreateRoleMappingDto {
  @ApiProperty({
    description: 'List of role names to assign',
    example: ['role name 1', 'role name 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleName: string[];
}
