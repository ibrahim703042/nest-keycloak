import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class MapGroupToMultipleUserDto {
  @ApiProperty({
    description: 'List of user Ids to assign',
    example: [
      '47adffb4-6649-4625-918b-ab6078971aaa',
      '3734262e-2d67-46ea-8b41-735ce2dd42d0',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userId: string[];

  @ApiProperty({
    description: 'Name of the group',
    example: 'Group name',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;
}

export class MapUserToGroupDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '47adffb4-6649-4625-918b-ab6078971aaa',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'List of group names to assign',
    example: ['group name 1', 'group name 2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  groupNames: string[];
}

export class CreateUserToGroupDto {
  @ApiProperty({
    description: 'ID of the user',
    example: 'userId',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Name of the group',
    example: 'group name',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;
}
