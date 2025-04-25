import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { KeycloakConfigService } from './keycloak-config.service';
import { AxiosError, AxiosResponse } from 'axios';
import {
  CustomAxiosRequestConfig,
  IKeycloakTokenResponse,
  IAuthorizationHeaders,
  KeycloakPayload,
} from '../types/keycloak.type';

@Injectable()
export class KeycloakBaseService {
  protected readonly logger: Logger;
  constructor(
    protected http: HttpService,
    protected config: KeycloakConfigService,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  protected readonly headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    headers?: any,
    retries: number = 6,
  ): Promise<T> {
    const config: CustomAxiosRequestConfig = {
      method,
      url,
      data,
      headers,
      timeout: 120000,
      retries,
    };

    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.http.request(config),
      );
      this.logger.debug(
        `${method.toUpperCase()} Response - URL: ${url}`,
        response.data,
      );
      return response.data;
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(`Retrying request (${retries} retries left)...`);
        return this.makeRequest<T>(method, url, data, headers, retries - 1);
      }
      this.handleError(error, url);
    }
  }

  private async getKeycloakToken(): Promise<IKeycloakTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<IKeycloakTokenResponse>(
          this.config.getAuthUrl('login'),
          {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: this.config.grantType,
          },
          { headers: this.headers },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Request Access Token');
    }
  }

  private getAuthorizationHeaders(token: string) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  protected async getAuthorizationHeadersWithToken(): Promise<IAuthorizationHeaders> {
    const token = await this.getKeycloakToken();
    const headers = this.getAuthorizationHeaders(token?.access_token);
    return headers;
  }

  protected async makePostRequest<T>(url: string, data: any): Promise<T> {
    const headers = await this.getAuthorizationHeadersWithToken();
    this.logger.log(`POST Request - URL: ${url}`, data);
    return await this.makeRequest<T>('post', url, data, headers);
  }

  protected async makeGetRequest<T>(url: string): Promise<T> {
    const headers = await this.getAuthorizationHeadersWithToken();
    this.logger.log(`GET Request - URL: ${url}`);
    return await this.makeRequest<T>('get', url, undefined, headers);
  }

  protected async makePutRequest<T>(url: string, data: any): Promise<T> {
    const headers = await this.getAuthorizationHeadersWithToken();
    this.logger.log(`PUT Request - URL: ${url}`, data);
    return await this.makeRequest<T>('put', url, data, headers);
  }

  protected async makeDeleteRequest(url: string, data: any): Promise<void> {
    const headers = await this.getAuthorizationHeadersWithToken();
    this.logger.log(`DELETE Request - URL: ${url}`, data);
    await this.makeRequest<void>('delete', url, data, headers);
    this.logger.debug(`DELETE Successful - URL: ${url}`);
  }

  protected buildKeycloakPayload(payload: KeycloakPayload): KeycloakPayload {
    return {
      username: payload.username,
      enabled: payload.enabled,
      totp: false,
      emailVerified: false,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      disableableCredentialTypes: [],
      requiredActions: payload.requiredActions || [],
      notBefore: 0,
      access: {
        manageGroupMembership: true,
        view: true,
        mapRoles: true,
        impersonate: true,
        manage: true,
      },
      groups: payload.groups,
      credentials: payload.credentials,
      realmRoles: payload.realmRoles,
      attributes: {},
    };
  }

  handleError = (error: any, url?: string): never => {
    const statusCode =
      error.status ||
      error.response?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    const responseData = error.response?.data || {};
    const errorMessage =
      responseData.error || error.message || 'An unexpected error occurred';

    const timestamp = new Date().toISOString();

    // Extract table/resource name from error message if available
    const resourceNameMatch = errorMessage.match(/'(.+?)'/);
    const resourceName = resourceNameMatch ? resourceNameMatch[1] : 'Resource';

    this.logger.error(
      `Error in ${resourceName}: ${url}`,
      JSON.stringify(responseData),
    );

    // if (
    //   statusCode === HttpStatus.NOT_FOUND ||
    //   errorMessage.includes('not found')
    // ) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.NOT_FOUND,
    //       message: `${resourceName} not found`,
    //       url,
    //       timestamp,
    //     },
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    if (error.name === 'ValidationError') {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Validation error: ${errorMessage}`,
          url,
          timestamp,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (error.code === 'ER_DUP_ENTRY') {
      const fieldMatch = error.message.match(/for key '(.+?)'/);
      const field = fieldMatch ? fieldMatch[1] : 'unknown field';
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: `The field '${field}' already exists.`,
          url,
          timestamp,
        },
        HttpStatus.CONFLICT,
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ER_CON_COUNT_ERROR') {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database connection failed. Please try again later.',
          url,
          timestamp,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: errorMessage || 'Unauthorized access.',
          url,
          timestamp,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: errorMessage || 'Forbidden access.',
          url,
          timestamp,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    throw new HttpException(
      {
        statusCode,
        message: errorMessage,
        url,
        timestamp,
      },
      statusCode,
    );
  };
}
