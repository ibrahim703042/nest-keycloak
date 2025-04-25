import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  TVA_SERVICE_NAME,
  TvaListResponse,
  TvaResponse,
  TvaServiceClient,
} from '../proto/generated/vat';
import { Empty } from '../proto/generated/google/protobuf/empty';

@Injectable()
export class VatClientService implements OnModuleInit {
  private readonly logger = new Logger(VatClientService.name);
  private vatService!: TvaServiceClient;

  constructor(
    @Inject('PRODUCT_SERVICE_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.vatService = this.client.getService<TvaServiceClient>('TvaService');
  }

  async getAllTvas(request: Empty): Promise<TvaListResponse> {
    try {
      const response = await firstValueFrom(
        this.vatService.getAllTvas(request),
      );

      if (!response?.tvas || response.tvas.length === 0) {
        this.logger.warn('No VAT entries found.');
      } else {
        this.logger.log(`Fetched ${response.tvas.length} VAT entries.`);
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error fetching VAT list:', error?.message);

      if (error.code === 5) {
        throw new NotFoundException(MESSAGES.TVA.noEntries);
      }

      throw new BadRequestException(
        error.message || 'Unknown error occurred while fetching VATs.',
      );
    }
  }

  async getTvaById(id: string): Promise<TvaResponse> {
    try {
      const response = await firstValueFrom(this.vatService.getTvaById({ id }));

      if (!response?.tva?.id) {
        throw new NotFoundException(MESSAGES.TVA.invalidId);
      }

      this.logger.log(`Fetched VAT entry with ID: ${response.tva.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Error fetching VAT with ID "${id}":`, error?.message);

      if (error.code === 5) {
        throw new NotFoundException(MESSAGES.TVA.invalidId);
      }

      throw new BadRequestException(
        error.message || 'Unknown error occurred while fetching VAT by ID.',
      );
    }
  }
}

export const MESSAGES = {
  TVA: {
    invalidId: 'VAT entry not found. Please configure it first.',
    noEntries: 'No VAT entries are configured yet.',
  },
};
