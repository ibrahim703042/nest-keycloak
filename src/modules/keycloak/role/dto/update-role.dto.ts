import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto, CreateUserRoleMappingDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateUserRoleMappingDto extends PartialType(
  CreateUserRoleMappingDto,
) {}
