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
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupService } from '../services/group.service';
import { KcApiConstants } from 'src/app.constants';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';

const crud = KcApiConstants.crud('group');
const member = KcApiConstants.crud('group', 'user');

@ApiBearerAuth('authorization')
@ApiTags('Group management')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateGroupDto,
    description: crud.create.description,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: crud.list.summaryPagination })
  @ApiResponse({
    status: 200,
    description: crud.list.response200,
  })
  @ApiResponse({
    status: 400,
    description: crud.list.response400,
  })
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.groupService.findWithPage(pageOptionsDto);
  }

  @Get('list/members/:id')
  @ApiOperation({ summary: member.list.listOfMembers })
  @ApiResponse({
    status: 200,
    description: member.list.response200,
  })
  findMembers(@Param('id') id: string) {
    return this.groupService.findMembers(id);
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
    return this.groupService.findOne(id);
  }

  @Get('only/name')
  @ApiOperation({ summary: crud.findByname.summary })
  @ApiResponse({
    status: 200,
    description: crud.findByname.response200,
  })
  @ApiResponse({
    status: 404,
    description: crud.findByname.response404,
  })
  findByName(@Query('name') name: string) {
    return this.groupService.getGroupByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateGroupDto,
    description: crud.update.description,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
