import {
  Controller,
  Post,
  Body,
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
import { UserRoleMappingService } from '../services/user-role-mapping.service';
import {
  CreateRoleMappingDto,
  CreateUserRoleMappingDto,
} from '../dto/create-role.dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';

const crud = ApiConstants.crud('role mapping');
const role_user = ApiConstants.crud('', 'Get users based on realm role');

@ApiBearerAuth('authorization')
@ApiTags('Realm role Mapping')
@Controller('user-role-mapping')
export class UserRoleMappingController {
  constructor(
    private readonly userRoleMappingService: UserRoleMappingService,
  ) {}

  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateUserRoleMappingDto,
    description: `name of the role. Allowed values are: ${Object.values(UserRole).join(', ')}.`,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() createRoleDto: CreateUserRoleMappingDto) {
    return this.userRoleMappingService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: crud.findAll.summary })
  @ApiResponse({
    status: 200,
    description: crud.findAll.response200,
  })
  @ApiResponse({
    status: 400,
    description: crud.findAll.response400,
  })
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.userRoleMappingService.findAllRoleMappings(pageOptionsDto);
  }

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
    return this.userRoleMappingService.findUsersByRole(filter);
  }

  @Get('groups/user-role')
  @ApiOperation({ summary: role_user.summary })
  @ApiResponse({
    status: 200,
    description: crud.findAll.response200,
  })
  @ApiResponse({
    status: 400,
    description: crud.findAll.response400,
  })
  getUsersByClientRole(@Query() filter: FilterRoleDto) {
    return this.userRoleMappingService.findUsersByGroupsAndRole(filter);
  }

  @Get(':userId')
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
    return this.userRoleMappingService.findRoleMappingsForUser(id);
  }

  @Post(':userId')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: CreateRoleMappingDto,
    description: crud.update.bodyDescription,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(
    @Param('userId') userId: string,
    @Body() updateRoleDto: CreateRoleMappingDto,
  ) {
    return this.userRoleMappingService.update(userId, updateRoleDto);
  }

  @Delete(':userId/remove-roles')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  async remove(
    @Param('userId') userId: string,
    @Body() dto: CreateRoleMappingDto,
  ) {
    return this.userRoleMappingService.remove(userId, dto);
  }
}
