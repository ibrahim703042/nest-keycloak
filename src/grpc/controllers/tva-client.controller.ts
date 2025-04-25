import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiConstants } from 'src/app.constants';
import { VatClientService } from '../services/vta-client.service';
import { TvaDto } from '../proto/generated/vat';

const crud = ApiConstants.crud('vat');

@ApiTags('Vat - client')
@Controller('vat-client')
export class VatClientController {
  constructor(private readonly vatClientService: VatClientService) {}

  @Get()
  @ApiOperation({ summary: 'Get all VAT entries' })
  @ApiResponse({ status: 200, description: 'List of VAT entries' })
  async getAllVat(): Promise<TvaDto[]> {
    const response = await this.vatClientService.getAllTvas({});
    return response.tvas;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get VAT by ID' })
  @ApiParam({ name: 'id', description: 'VAT ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Single VAT entry' })
  async getVatById(@Param('id') id: string): Promise<TvaDto> {
    const response = await this.vatClientService.getTvaById(id);
    return response.tva!;
  }
}
