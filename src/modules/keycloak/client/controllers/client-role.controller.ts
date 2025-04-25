import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KcApiConstants } from 'src/app.constants';
import { ClientRoleService } from '../services/client-role.service';
import {
  CreateClientRoleDto,
  RemoveClientRoleDto,
} from '../dto/create-client.dto';
import { UpdateClientRoleDto } from '../dto/update-client.dto';

const crud = KcApiConstants.crud('client role');

@ApiBearerAuth('authorization')
@ApiTags('Client role management')
@Controller('client-roles')
export class ClientRoleController {
  constructor(private readonly roleService: ClientRoleService) {}
  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateClientRoleDto,
    description: crud.create.description,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() createDto: CreateClientRoleDto) {
    return this.roleService.create(createDto);
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
  findAll(@Query('clientId') clientId: string) {
    return this.roleService.findAll(clientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateClientRoleDto,
    description: crud.update.description,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateDto: UpdateClientRoleDto) {
    return this.roleService.update(id, updateDto);
  }

  @Delete()
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Body() removeDto: RemoveClientRoleDto) {
    return this.roleService.remove(removeDto);
  }
}
