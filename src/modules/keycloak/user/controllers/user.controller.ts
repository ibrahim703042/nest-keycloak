import {
  Controller,
  Post,
  Body,
  Patch,
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
import { KcApiConstants } from 'src/app.constants';
import {
  ChangePassWordDto,
  CreateUserDto,
  UserAccountStatusDto,
} from '../dto/create-user.dto';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';

const crud = KcApiConstants.crud('user');
const member = KcApiConstants.crud('group', 'user');

@ApiBearerAuth('authorization')
@ApiTags('Other parameter of User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // @ApiOperation({ summary: crud.create.summary })
  // @ApiBody({
  //   type: CreateUserDto,
  //   description: crud.create.description,
  // })
  // @ApiResponse({ status: 201, description: crud.create.response201 })
  // @ApiResponse({ status: 400, description: crud.create.response400 })
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @Get()
  // @ApiOperation({ summary: crud.list.summaryPagination })
  // @ApiResponse({
  //   status: 200,
  //   description: crud.list.response200,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: crud.list.response400,
  // })
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
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
  //   return this.userService.findOne(id);
  // }

  @Put(':userId/password')
  @ApiOperation({
    summary: 'Update user password',
    description: 'Allows updating the password for a specific user.',
  })
  @ApiBody({
    description: 'The new password and confirmation password for the user.',
    type: ChangePassWordDto,
  })
  async updatePassword(
    @Param('userId') userId: string,
    @Body() dto: ChangePassWordDto,
  ) {
    return this.userService.updatePassword(userId, dto);
  }

  @Put(':userId/account-status')
  @ApiOperation({
    summary: 'Update user account status',
    description:
      'Allows enabling or disabling a user account based on the provided status.',
  })
  @ApiBody({
    description: 'The enable or disable status of the user account.',
    type: UserAccountStatusDto,
  })
  async updateUserAccountStatus(
    @Param('userId') userId: string,
    @Body() dto: UserAccountStatusDto,
  ) {
    return this.userService.updateUserAccountStatus(userId, dto);
  }

  @Get('only/username')
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
    return this.userService.findUserByUsername(name);
  }

  @Get('only/mail')
  @ApiOperation({ summary: crud.findByname.summary })
  @ApiResponse({
    status: 200,
    description: crud.findByname.response200,
  })
  @ApiResponse({
    status: 404,
    description: crud.findByname.response404,
  })
  findUserByEmail(@Query('email') email: string) {
    return this.userService.findUserByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateUserDto,
    description: crud.update.description,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
