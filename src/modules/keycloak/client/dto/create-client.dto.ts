import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Kc_Client, Kc_Role } from 'src/helpers/keycloak-config/types/declare';

export class CreateClientDto implements Kc_Client {
  @ApiProperty({
    example: 'resto-bar',
    description: 'The client ID',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    example: 'resto-bar',
    description: 'The name of the client',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A description of the client',
    description: 'The description of the client',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the client is enabled',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class CreateClientRoleDto implements Kc_Client {
  @ApiProperty({
    example: 'clientId',
    description: 'Client Id',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    example: 'admin',
    description: 'The name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Admin role for managing the client',
    description: 'The description of the role',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  clientRole: true;
}

export class RemoveClientRoleDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
