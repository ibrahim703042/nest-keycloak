import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiConstants } from 'src/app.constants';
import { FilterRoleDto } from 'src/utils/enum/filter/filter.dto';
import { UserRole } from 'src/utils/enum/enumerations.enum';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RealmRoleService } from '../services/realm-role.service';
import { UserRoleMappingService } from '../services/user-role-mapping.service';

const crud = ApiConstants.crud('realmRole');
const role_user = ApiConstants.crud('', 'Get users based on realm role');

@ApiBearerAuth('authorization')
@ApiTags('Realm Role Management')
@Controller('realm-roles')
export class RealmRoleController {
  constructor(
    private readonly realmRoleService: RealmRoleService,
    private readonly userRoleMappingService: UserRoleMappingService,
  ) {}

  // @Post()
  // @ApiOperation({ summary: crud.create.summary })
  // @ApiBody({
  //   type: CreateRoleDto,
  //   // description: crud.create.bodyDescription,
  //   description: `name of the role. Allowed values are: ${Object.values(UserRole).join(', ')}.`,
  // })
  // @ApiResponse({ status: 201, description: crud.create.response201 })
  // @ApiResponse({ status: 400, description: crud.create.response400 })
  // create(@Body() createRoleDto: CreateRoleDto) {
  //   return this.realmRoleService.create(createRoleDto);
  // }

  // @Get()
  // @ApiOperation({ summary: crud.findAll.summary_withoutPagination })
  // @ApiResponse({
  //   status: 200,
  //   description: crud.findAll.response200,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: crud.findAll.response400,
  // })
  // findAll() {
  //   return this.realmRoleService.findAll();
  // }

  @Get('user-role')
  @ApiOperation({ summary: role_user.summary })
  @ApiResponse({
    status: 200,
    description: crud.findAll.response200,
  })
  @ApiResponse({
    status: 400,
    description: crud.findAll.response400,
  })
  getUserRole(@Query() filter: FilterRoleDto) {
    // return this.realmRoleService.getAssignedUsersToRealmRole(filter);
    return this.userRoleMappingService.findUsersByGroupsAndRole(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: crud.findOne.summary })
  @ApiResponse({
    status: 200,
    description: crud.findOne.response200,
  })
  @ApiResponse({
    status: 404,
    description: crud.findOne.response404,
  })
  findOne(@Param('id') id: string) {
    return this.realmRoleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateRoleDto,
    description: crud.update.bodyDescription,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.realmRoleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.realmRoleService.remove(id);
  }
}
