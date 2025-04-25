import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Min,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GenderType } from 'src/utils/enum/enumerations.enum';
import { CreateUserDto } from 'src/modules/keycloak/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/keycloak/user/dto/update-user.dto';

export class CreateUserInfoDto {
  @ApiProperty({
    description: 'Details for creating a Keycloak user',
    type: CreateUserDto,
  })
  @ValidateNested()
  @Type(() => CreateUserDto)
  @IsNotEmpty()
  userInfo: CreateUserDto;

  @ApiPropertyOptional({
    description: 'Address of the user',
    example: '123 Main St, Paris',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Age of the user', example: 25 })
  @Min(0)
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: GenderType.MALE,
  })
  @IsString()
  @IsEnum(GenderType)
  gender: GenderType;

  @ApiPropertyOptional({
    description: 'Stores the user is associated with',
    example: ['6756be78399de019c0ca8d19', '6756beb2399de019c0ca8d27'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  store: string[];
}

export class UpdateKcUserInfoDto {
  @ApiProperty({
    description: 'Details for creating a Keycloak user',
    type: UpdateUserDto,
  })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  @IsNotEmpty()
  userInfo: UpdateUserDto;

  @ApiPropertyOptional({
    description: 'Address of the user',
    example: '123 Main St, Paris',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Age of the user', example: 25 })
  @Min(0)
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: GenderType.MALE,
  })
  @IsString()
  @IsEnum(GenderType)
  gender: GenderType;

  @ApiPropertyOptional({
    description: 'Stores the user is associated with',
    example: ['6756be78399de019c0ca8d19', '6756beb2399de019c0ca8d27'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  store: string[];
}

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'Profile of the user',
    example: 'avatar.jpg',
  })
  @IsString()
  avatar: string;
}
