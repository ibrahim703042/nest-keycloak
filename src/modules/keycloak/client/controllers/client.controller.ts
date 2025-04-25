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
import { KcApiConstants } from 'src/app.constants';
import { CreateClientDto } from '../dto/create-client.dto';
import { ClientService } from '../services/client.service';
import { UpdateClientDto } from '../dto/update-client.dto';

const crud = KcApiConstants.crud('client');

@ApiBearerAuth('authorization')
@ApiTags('Client management')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateClientDto,
    description: crud.create.description,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: crud.list.summaryNoPagination })
  @ApiResponse({
    status: 200,
    description: crud.list.response200,
  })
  @ApiResponse({
    status: 400,
    description: crud.list.response400,
  })
  findAll() {
    return this.clientService.findAll();
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
    return this.clientService.findOne(id);
  }

  // @Get('/list/clientId')
  // @ApiOperation({ summary: crud.findOne.summary })
  // @ApiResponse({
  //   status: 200,
  //   description: crud.findOne.response200,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: crud.findOne.response404,
  // })
  // findByClientId(@Query('clientId') clientId: string) {
  //   return this.clientService.findByClientId(clientId);
  // }

  @Get('list/sessions')
  @ApiOperation({
    summary: 'Retrieve all user(s) sessions based on client ID in keycloak',
  })
  @ApiResponse({
    status: 200,
    description: crud.findOne.response200,
  })
  @ApiResponse({
    status: 404,
    description: crud.findOne.response404,
  })
  findSession(@Query('clientId') clientId: string) {
    return this.clientService.findSessionByClientId(clientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateClientDto,
    description: crud.update.description,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
