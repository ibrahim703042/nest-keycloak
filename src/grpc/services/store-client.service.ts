import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  StoreServiceClient,
  StoreResponse,
  StoreListResponse,
  STORE_SERVICE_NAME,
} from '../proto/generated/store';

@Injectable()
export class StoreClientService implements OnModuleInit {
  private storeService!: StoreServiceClient;

  constructor(
    @Inject(STORE_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.storeService =
      this.client.getService<StoreServiceClient>('StoreService');
  }

  async getStoreById(id: string): Promise<StoreResponse> {
    try {
      return await firstValueFrom(this.storeService.getStoreById({ id }));
    } catch (error) {
      console.error('gRPC error in getStoreById:', error);
      throw error;
    }
  }

  async getStores(ids: string[]): Promise<StoreListResponse> {
    try {
      return await firstValueFrom(this.storeService.getStores({ ids }));
    } catch (error) {
      console.error('gRPC error in getStores:', error);
      throw error;
    }
  }

  async getStoresByStatus(status: boolean): Promise<StoreListResponse> {
    try {
      return await firstValueFrom(
        this.storeService.getStoresByStatus({ status }),
      );
    } catch (error) {
      console.error('gRPC error in getStoresByStatus:', error);
      throw error;
    }
  }
}
