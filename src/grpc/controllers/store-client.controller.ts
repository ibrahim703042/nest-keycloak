import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreClientService } from '../services/store-client.service';
import { ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Store - client')
@Controller('stores')
export class StoreClientController {
  constructor(private readonly storeClient: StoreClientService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Mongoose ObjectId of the store',
    example: '6756be78399de019c0ca8d19',
  })
  async getStoreById(@Param('id') id: string) {
    return this.storeClient.getStoreById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get multiple stores by IDs' })
  @ApiQuery({
    name: 'ids',
    type: String,
    required: true,
    description: 'Comma-separated list of Mongoose ObjectIds',
    example: '6756be78399de019c0ca8d19,6756beb2399de019c0ca8d27',
  })
  async getStores(@Query('ids') ids: string) {
    const storeIds = ids.split(',').map((id) => id.trim());
    return this.storeClient.getStores(storeIds);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get stores by status (active/inactive)' })
  @ApiParam({
    name: 'status',
    type: String,
    description: 'Store status: true (active) or false (inactive)',
    example: 'true',
  })
  async getStoresByStatus(@Param('status') status: string) {
    const isActive = status.toLowerCase() === 'true';
    return this.storeClient.getStoresByStatus(isActive);
  }
}
