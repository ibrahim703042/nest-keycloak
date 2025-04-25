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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { ApiConstants } from 'src/app.constants';
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto } from './dto/create-fiscal-year.dto';
import {
  UpdateFiscalYearDto,
  UpdateFiscalYearStatusDto,
} from './dto/update-fiscal-year.dto';
import { Request } from 'express';

const crud = ApiConstants.crud('fiscalYear');

@ApiTags('Gestion des exercices fiscaux')
@Controller('fiscal-years')
export class FiscalYearController {
  constructor(private readonly fiscalYearService: FiscalYearService) {}

  @Post()
  @ApiOperation({ summary: crud.create.summary })
  @ApiBody({
    type: CreateFiscalYearDto,
    description: crud.create.bodyDescription,
  })
  @ApiResponse({ status: 201, description: crud.create.response201 })
  @ApiResponse({ status: 400, description: crud.create.response400 })
  create(@Body() createFiscalYearDto: CreateFiscalYearDto) {
    return this.fiscalYearService.create(createFiscalYearDto);
  }

  @Get()
  @ApiOperation({ summary: crud.findAll.summary })
  @ApiResponse({ status: 200, description: crud.findAll.response200 })
  @ApiResponse({ status: 400, description: crud.findAll.response400 })
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.fiscalYearService.findAll(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: crud.findOne.summary })
  @ApiResponse({ status: 200, description: crud.findOne.response200 })
  @ApiResponse({ status: 404, description: crud.findOne.response404 })
  findOne(@Param('id') id: string) {
    return this.fiscalYearService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateFiscalYearDto,
    description: crud.update.bodyDescription,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  update(
    @Param('id') id: string,
    @Body() updateFiscalYearDto: UpdateFiscalYearDto,
  ) {
    return this.fiscalYearService.update(id, updateFiscalYearDto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: crud.update.summary })
  @ApiBody({
    type: UpdateFiscalYearDto,
    description: crud.update.bodyDescription,
  })
  @ApiResponse({ status: 200, description: crud.update.response200 })
  @ApiResponse({ status: 400, description: crud.update.response400 })
  @ApiResponse({ status: 404, description: crud.update.response404 })
  closeFiscalYear(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() dto: UpdateFiscalYearStatusDto,
  ) {
    return this.fiscalYearService.closeFiscalYear(id, dto, request);
  }

  @Delete(':id')
  @ApiOperation({ summary: crud.remove.summary })
  @ApiResponse({ status: 204, description: crud.remove.response204 })
  @ApiResponse({ status: 404, description: crud.remove.response404 })
  remove(@Param('id') id: string) {
    return this.fiscalYearService.remove(id);
  }
}
