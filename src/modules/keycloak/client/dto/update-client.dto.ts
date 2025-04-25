import { PartialType } from '@nestjs/swagger';
import { CreateClientDto, CreateClientRoleDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
export class UpdateClientRoleDto extends PartialType(CreateClientRoleDto) {}
