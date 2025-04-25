import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { KeycloakBaseService } from './config/keycloak-base.service';
import { KeycloakConfigService } from './config/keycloak-config.service';
import { ResponseI18nService } from '../translate/server-response/response-i18n.service';

@Injectable()
export class KeycloakAuthService extends KeycloakBaseService {
  protected readonly logger = new Logger(KeycloakAuthService.name);

  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
  ) {
    super(httpService, config, KeycloakAuthService.name);
  }

  /** Login user using Keycloak */
  async login(user: { username: string; password: string }): Promise<any> {
    try {
      const data = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: user.username,
        password: user.password,
        grant_type: 'password',
      }).toString();

      const response = await firstValueFrom(
        this.http.post(this.config.getAuthUrl('login'), data, {
          headers: this.headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error, '');
    }
  }

  async logout(refreshToken: string): Promise<any> {
    try {
      const data = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        // grant_type: 'password',
      }).toString();

      const response = await firstValueFrom(
        this.http.post(this.config.getAuthUrl('logout'), data, {
          headers: this.headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error, '');
    }
  }

  /** Log out user from Keycloak */

  async logoutUser(userId: string): Promise<{ message: string }> {
    try {
      const url = this.config.getAuthUrl('logout/{userId}', userId);
      await this.makePostRequest(url, {});
      return { message: `User with ID ${userId} logged out successfully` };
    } catch (error) {
      this.logAndHandleError(
        `Failed to log out user in Keycloak - UserID: ${userId}`,
        error,
      );
    }
  }

  /** Log and handle errors consistently */
  private logAndHandleError(message: string, error: any) {
    this.logger.error(message, error.response?.data || error.message);
    this.handleError(error, '');
  }
}
