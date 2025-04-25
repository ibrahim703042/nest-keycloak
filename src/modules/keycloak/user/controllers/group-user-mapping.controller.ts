import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Query,
  Put,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupUserMappingService } from '../services/group-user-mapping.service';
import { KcApiConstants } from 'src/app.constants';
import {
  MapGroupToMultipleUserDto,
  MapUserToGroupDto,
} from 'src/modules/keycloak/group/dto/map-user-group.dto';
import { Kc_User } from 'src/helpers/keycloak-config/types/declare';

const group = KcApiConstants.dataMapped('user', 'group');
const userGroups = KcApiConstants.dataMapped('group', 'user');
const groupUsers = KcApiConstants.dataMapped('user', 'group');

@ApiBearerAuth('authorization')
@ApiTags('User group Mapping')
@Controller('user-group-mapping')
export class GroupUserMappingController {
  constructor(private readonly userMappingService: GroupUserMappingService) {}

  @Post('user/groups')
  @ApiOperation({ summary: group.assign.summary })
  @ApiBody({
    type: MapUserToGroupDto,
    description: group.assign.description,
  })
  @ApiResponse({ status: 201, description: group.assign.response200 })
  @ApiResponse({ status: 400, description: group.assign.response400 })
  assignRoleToGroup(@Body() createRoleDto: MapUserToGroupDto) {
    return this.userMappingService.mapUserToGroup(createRoleDto);
  }

  @Put('group/users')
  @ApiOperation({ summary: group.assign.summaryMultiple })
  @ApiBody({
    type: MapGroupToMultipleUserDto,
    description: group.assign.description,
  })
  @ApiResponse({ status: 201, description: group.assign.response200 })
  @ApiResponse({ status: 400, description: group.assign.response400 })
  assignUsersToGroup(@Body() dto: MapGroupToMultipleUserDto) {
    return this.userMappingService.mapUsersToGroup(dto);
  }

  @Get('user/list/groups')
  @ApiOperation({ summary: userGroups.list.summaryAssign })
  @ApiResponse({
    status: 200,
    description: group.list.response200,
  })
  @ApiResponse({
    status: 204,
    description: group.list.response204,
  })
  @ApiResponse({
    status: 400,
    description: group.list.response400,
  })
  findMapUsersToGroup() {
    return this.userMappingService.findMapUsersToGroup();
  }

  @Get('group/list/users')
  @ApiOperation({ summary: groupUsers.list.summaryAssign })
  @ApiResponse({
    status: 200,
    description: group.list.response200,
  })
  @ApiResponse({
    status: 204,
    description: group.list.response204,
  })
  @ApiResponse({
    status: 400,
    description: group.list.response400,
  })
  findMapGroupToUsers() {
    return this.userMappingService.findMapGroupToUsers();
  }

  @Get('members')
  @ApiOperation({ summary: group.list.summary })
  @ApiResponse({
    status: 200,
    description: group.list.response200,
  })
  @ApiResponse({
    status: 400,
    description: group.list.response400,
  })
  getUserRole(@Query('groupName') groupName: string) {
    return this.userMappingService.findGroupMembers(groupName);
  }

  @Get(':userId')
  @ApiOperation({ summary: group.findOne.summary })
  @ApiResponse({
    status: 200,
    description: group.findOne.response200,
  })
  @ApiResponse({
    status: 404,
    description: group.findOne.response404,
  })
  findOne(@Param('userId') userId: string) {
    return this.userMappingService.findGroupByUserId(userId);
  }

  // @Put()
  // @ApiOperation({ summary: group.assign.summary })
  // @ApiBody({
  //   type: MapUserToGroupDto,
  //   description: group.assign.description,
  // })
  // @ApiResponse({ status: 200, description: group.assign.response200 })
  // @ApiResponse({ status: 400, description: group.assign.response400 })
  // update(@Body() dto: MapUserToGroupDto) {
  //   return this.userMappingService.update(dto);
  // }

  @Delete('multiple')
  @ApiOperation({ summary: group.remove.summary })
  @ApiResponse({ status: 204, description: group.remove.response204 })
  @ApiResponse({ status: 404, description: group.remove.response400 })
  async removeUsersFromGroup(@Body() dto: MapGroupToMultipleUserDto) {
    const userMappings = dto.userId.map((id) => ({ id }) as Kc_User);
    return this.userMappingService.removeUsersFromGroup(
      dto.groupName,
      userMappings,
    );
  }
}
