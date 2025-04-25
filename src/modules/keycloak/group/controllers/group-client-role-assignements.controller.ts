import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiConstants, KcApiConstants } from 'src/app.constants';
import {
  AssignClientRoleToGroupDto,
  CreateClientRoleToGroupDto,
} from '../dto/create-group.dto';
import { ClientRoleGroupService } from '../services/client-role-group.service';
import { CreateRoleMappingDto } from 'src/modules/keycloak/role/dto/create-role.dto';
import { FilterClientDto } from 'src/modules/keycloak/filter/kc-filter';

const role = KcApiConstants.dataMapped('client role', 'group');

@ApiBearerAuth('authorization')
@ApiTags('Group client-role mapping')
@Controller('group-role-mapping')
export class GroupRoleMappingController {
  constructor(
    private readonly clientRoleGroupService: ClientRoleGroupService,
  ) {}

  @Post('client-role')
  @ApiOperation({ summary: role.assign.summary })
  @ApiBody({
    type: AssignClientRoleToGroupDto,
    description: role.assign.description,
  })
  @ApiResponse({ status: 201, description: role.assign.response200 })
  @ApiResponse({ status: 400, description: role.assign.response400 })
  assignRoleToGroup(@Body() createRoleDto: AssignClientRoleToGroupDto) {
    return this.clientRoleGroupService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: role.list.summary })
  @ApiResponse({
    status: 200,
    description: role.list.response200,
  })
  @ApiResponse({
    status: 204,
    description: role.list.response204,
  })
  @ApiResponse({
    status: 400,
    description: role.list.response400,
  })
  findClientRoleByGroup(@Query() dto: CreateClientRoleToGroupDto) {
    return this.clientRoleGroupService.availableClientRoleInGroup(dto);
  }

  @Get('groups/client-role')
  @ApiOperation({ summary: role.list.summary })
  @ApiResponse({
    status: 200,
    description: role.list.response200,
  })
  @ApiResponse({
    status: 404,
    description: role.list.response400,
  })
  findOne(@Query() dto: FilterClientDto) {
    return this.clientRoleGroupService.findAllRoleMappings(dto);
  }

  // @Get('user-role')
  // @ApiOperation({ summary: role_user.summary })
  // @ApiResponse({
  //   status: 200,
  //   description: crud.findAll.response200,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: crud.findAll.response400,
  // })
  // getUserRole(@Query() filter: FilterRoleDto) {
  //   return this.clientRoleGroupService.findUsersByRole(filter);
  // }

  // @Get(':userId')
  // @ApiOperation({ summary: crud.findOne.summary })
  // @ApiResponse({
  //   status: 200,
  //   description: crud.findOne.response200,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: crud.findOne.response404,
  // })
  // findOne(@Param('id') id: string) {
  //   return this.clientRoleGroupService.findRoleMappingsForUser(id);
  // }

  @Patch()
  @ApiOperation({ summary: role.assign.summary })
  @ApiBody({
    type: AssignClientRoleToGroupDto,
    description: role.assign.description,
  })
  @ApiResponse({ status: 200, description: role.assign.response200 })
  @ApiResponse({ status: 400, description: role.assign.response400 })
  update(@Body() updateRoleDto: AssignClientRoleToGroupDto) {
    return this.clientRoleGroupService.update(updateRoleDto);
  }

  @Delete()
  // @Delete('unassigned/client/role')
  @ApiOperation({ summary: role.remove.summary })
  @ApiResponse({ status: 204, description: role.remove.response204 })
  @ApiResponse({ status: 404, description: role.remove.response400 })
  async remove(
    @Query() ids: CreateClientRoleToGroupDto,
    @Body() roles: CreateRoleMappingDto,
  ) {
    return this.clientRoleGroupService.remove(ids, roles);
  }
}
