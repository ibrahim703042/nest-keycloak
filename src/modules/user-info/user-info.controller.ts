import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import {
  CreateUserInfoDto,
  UpdateKcUserInfoDto,
} from './dto/create-user-info.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiConstants } from 'src/app.constants';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { UserInfoService } from './user-info.service';
import { Request } from 'express';

const crud = ApiConstants.crud('user');

@ApiTags('User management')
@ApiBearerAuth('authorization')
@Controller('user-infos')
export class UserInfoController {
  constructor(private readonly userService: UserInfoService) {}
  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateUserInfoDto,
    description: crud.create.bodyDescription,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() CreateUserInfoDto: CreateUserInfoDto) {
    return this.userService.create(CreateUserInfoDto);
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
    return this.userService.findAll(pageOptionsDto);
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
    return this.userService.findOne(id);
  }

  @Get('user/stores')
  @ApiOperation({
    summary:
      'Retrieve the authenticated user’s information, including associated stores, from the token',
  })
  @ApiResponse({
    status: 200,
    description: crud.findOne.response200,
  })
  @ApiResponse({
    status: 404,
    description: crud.findOne.response404,
  })
  findByUserId(@Req() req: Request) {
    return this.userService.findByUserInfo(req);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateKcUserInfoDto,
    description: crud.update.bodyDescription,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateKcUserInfoDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
