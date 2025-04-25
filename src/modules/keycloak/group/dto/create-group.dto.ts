import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Kc_AssignClientRoleToGroupDto,
  Kc_Group,
} from 'src/helpers/keycloak-config/types/declare';

export class CreateGroupDto implements Kc_Group {
  @ApiProperty({
    example: 'Group name',
    description: 'Name of the group.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateGroupRoleMappingDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '12345678-abcd-90ef-ghij-1234567890kl',
  })
  @IsString()
  groupId: string;

  @ApiProperty({
    description: 'List of role names to assign',
    example: ['admin', 'waiter'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleName: string[];
}

export class AssignUsersToGroupDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '12345678-abcd-90ef-ghij-1234567890kl',
  })
  @IsString()
  groupId: string;

  @ApiProperty({
    description: 'List of user names to assign',
    example: ['user 1', 'user 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userId: string[];
}

export class AssignClientRoleToGroupDto
  implements Kc_AssignClientRoleToGroupDto
{
  @ApiProperty({
    description: 'ID of the client',
    example: 'clientId',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Name of the group',
    example: 'group name',
    required: false,
  })
  @IsString()
  // @IsNotEmpty()
  @IsOptional()
  groupName: string;

  @ApiProperty({
    description: 'List of role names to assign to the group',
    example: ['role name 1', 'role name 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleNames: string[];
}

export class CreateGroupMappingDto {
  @ApiProperty({
    description: 'List of user names to assign',
    example: ['user 1', 'user 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  groupName: string[];
}

export class MappedUserToGroupDto {
  @ApiProperty({
    description: 'ID of the client',
    example: 'clientId',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Name of the group',
    example: 'group name',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;
}

export class CreateClientRoleToGroupDto {
  @ApiProperty({
    description: 'ID of the client',
    example: 'clientId',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Name of the group',
    example: 'group name',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;
}
