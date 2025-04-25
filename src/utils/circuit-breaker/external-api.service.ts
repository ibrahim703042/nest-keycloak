import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import CircuitBreaker from 'opossum';
import { Observable, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  private readonly circuitBreakers: Record<string, CircuitBreaker> = {};

  private static readonly DEFAULT_TIMEOUT = 60000;
  private static readonly CIRCUIT_BREAKER_OPTIONS = {
    timeout: 90000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  };

  constructor(
    @Inject('SERVICE_STOCK') private readonly stockService: ClientProxy,
    @Inject('SERVICE_COMMANDE') private readonly orderService: ClientProxy,
  ) {
    // Initialize Circuit Breakers for each service
    this.initializeCircuitBreaker('StockService', this.stockService);
    this.initializeCircuitBreaker('CommandeService', this.orderService);
  }

  private initializeCircuitBreaker(
    serviceName: string,
    client: ClientProxy,
    options: Partial<typeof ExternalApiService.CIRCUIT_BREAKER_OPTIONS> = {},
  ): void {
    const breaker = new CircuitBreaker(this.makeRequest.bind(this, client), {
      ...ExternalApiService.CIRCUIT_BREAKER_OPTIONS,
      ...options,
    });

    this.setupCircuitBreakerLogging(breaker, serviceName);
    this.circuitBreakers[serviceName] = breaker;
  }

  private setupCircuitBreakerLogging(
    breaker: CircuitBreaker,
    serviceName: string,
  ): void {
    breaker.on('open', () =>
      this.logger.warn(`${serviceName} Circuit opened!`),
    );
    breaker.on('close', () =>
      this.logger.log(`${serviceName} Circuit closed!`),
    );
    breaker.on('halfOpen', () =>
      this.logger.log(`${serviceName} Circuit is half-open, testing...`),
    );
    breaker.on('failure', (error: { message: any }) =>
      this.logger.error(
        `${serviceName} Circuit breaker failure: ${error.message}`,
      ),
    );
  }

  private async makeRequest(
    client: ClientProxy,
    pattern: string,
    data: any,
  ): Promise<any> {
    try {
      const dataResponse: Observable<any> = client.send({ cmd: pattern }, data);
      const response = await firstValueFrom(
        dataResponse.pipe(timeout(ExternalApiService.DEFAULT_TIMEOUT)),
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error in makeRequest for pattern "${pattern}": ${error.message}`,
      );
      throw error;
    }
  }

  public async sendRequestService(
    serviceName: string,
    pattern: string,
    data: any,
  ): Promise<any> {
    const breaker = this.circuitBreakers[serviceName];
    if (!breaker) {
      throw new Error(`No Circuit Breaker found for service "${serviceName}"`);
    }

    try {
      return await breaker.fire(pattern, data);
    } catch (error) {
      this.logger.error(
        `Circuit breaker error for service "${serviceName}", pattern "${pattern}": ${error.message}`,
      );
      // return {
      //   success: false,
      //   message: 'Service is temporary unvailable',
      //   error: error.message,
      // };
      return {
        message: `The ${serviceName} is unvailable, plz try again later`,
      };
    }
  }
}
