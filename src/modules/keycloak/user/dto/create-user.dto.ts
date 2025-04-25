import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  id?: string;

  @ApiProperty({
    description:
      'Username for the user. This must be unique across the Keycloak system.',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiPropertyOptional({
    description: 'First name of the user.',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user.',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description:
      'Email of the user. Must be unique in Keycloak and in a valid email format.',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user.',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description:
      'Indicates whether the user account is enabled or disabled. Set to true to enable the account, false to disable it.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates if the user is temporary or permanent.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  temporary?: boolean;

  @ApiProperty({
    description: 'Groups the user belongs to.',
    example: [],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  groupNames: string[];
}

export class UserAccountStatusDto extends PickType(CreateUserDto, [
  'enabled',
] as const) {}

export class ChangePassWordDto extends PickType(CreateUserDto, [
  'password',
  'temporary',
] as const) {
  @ApiProperty({
    description: 'Confirmation of the new password. Must match the password.',
    example: 'JohnDoe123!',
  })
  confirmPassword: string;
}
