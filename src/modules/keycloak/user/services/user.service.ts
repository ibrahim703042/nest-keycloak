import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { KeycloakPayload } from 'src/helpers/keycloak-config/types/keycloak.type';
import { Kc_User } from 'src/helpers/keycloak-config/types/declare';
import {
  ApiResponse,
  ResponseData,
} from 'src/helpers/translate/types/i18n.types';
import {
  ChangePassWordDto,
  CreateUserDto,
  UserAccountStatusDto,
} from '../dto/create-user.dto';
import { KcI18nService } from 'src/helpers/translate/server-response/kc-i18n-response.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService extends KeycloakBaseService {
  protected readonly logger = new Logger(UserService.name);

  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly kcI18nService: KcI18nService,
  ) {
    super(httpService, config, UserService.name);
  }

  async create(keycloakUserDto: CreateUserDto) {
    return await this.createPayload({
      username: keycloakUserDto.username,
      email: keycloakUserDto.email,
      firstName: keycloakUserDto.firstName,
      lastName: keycloakUserDto.lastName,
      enabled: keycloakUserDto.enabled ?? false,
      totp: false,
      emailVerified: false,
      groups: keycloakUserDto.groupNames ?? [],

      credentials: keycloakUserDto.password
        ? [
            {
              type: 'password',
              value: keycloakUserDto.password,
              temporary: keycloakUserDto.temporary ?? false,
            },
          ]
        : undefined,
    });
  }

  async updateUser(userId: string, userDto: UpdateUserDto) {
    const updatePayload = {
      email: userDto.email,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      // enabled: userDto.enabled,
      groups: userDto.groupNames,
    };

    return await this.updatePayload(userId, updatePayload);
  }

  async updatePassword(userId: string, dto: ChangePassWordDto) {
    const url = this.config.getUserUrl('resetPassword', { userId });

    try {
      if (dto.password !== dto.confirmPassword) {
        return this.responseI18nService.badRequest(
          'USER.PASSWORD_MISMATCH',
          'USER',
        );
      }

      const payload = {
        type: 'password',
        value: dto.password,
        temporary: dto.temporary ?? false,
      };

      const response = await this.makePutRequest(url, payload);

      return this.kcI18nService.password(
        'global.KEYCLOAK.USERS.PASSWORD',
        'USER',
        response,
      );
    } catch (error) {
      throw this.handleError(error, url);
    }
  }

  async updateUserAccountStatus(userId: string, dto: UserAccountStatusDto) {
    const url = this.config.getUserUrl('userById', { userId });

    try {
      const payload = dto;

      const response = await this.makePutRequest(url, payload);
      if (dto.enabled == true) {
        return this.kcI18nService.accountStatus(
          'global.KEYCLOAK.USERS.ACTIVE',
          'USER',
          response,
        );
      } else {
        return this.kcI18nService.accountStatus(
          'global.KEYCLOAK.USERS.DEACTIVATE',
          'USER',
          response,
        );
      }
    } catch (error) {
      throw this.handleError(error, url);
    }
  }

  async findAll(): Promise<ApiResponse<Kc_User> | any> {
    const url = this.config.getUserUrl('users');
    try {
      const users = (await this.makeGetRequest(url)) as Kc_User[];

      // return { data: users };
      return this.responseI18nService.fetchAll(users, 'USER');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.fetchAll([], 'USER');
      }
      return this.responseI18nService.fetchAll([], 'USER');
    }
  }

  async findUserById(
    id: string,
  ): Promise<FormattedUser | Record<string, never>> {
    const url = this.config.getUserUrl('userById', { userId: id });
    try {
      const response = (await this.makeGetRequest<Kc_User>(url)) as Kc_User;
      if (!response) {
        return {};
      } else {
        const formattedUserData: FormattedUser = {
          userId: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        };

        return formattedUserData;
      }
    } catch (error) {
      this.handleError(error, url);
    }
  }

  async findOne(id: string): Promise<ResponseData<Kc_User> | any> {
    const url = this.config.getUserUrl('userById', { userId: id });
    try {
      const data = await this.makeGetRequest(url);
      console.log('Data :', data);

      return this.responseI18nService.success(data, 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to find user in Keycloak - UserID: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'user');
    }
  }

  async remove(id: string) {
    const url = this.config.getUserUrl('userById', { userId: id });
    try {
      const data = await this.makeDeleteRequest(url, undefined);

      return this.responseI18nService.delete(data, 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to delete user in Keycloak - UserId: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findUserByEmail(email: string): Promise<Kc_User | any> {
    const url = this.config.getUserUrl('userByMail', { userMail: email });
    const user = (await this.makeGetRequest(url)) as Kc_User;
    this.logger.debug('Found user by email:', user[0]);
    return user;
  }

  async findUserByUsername(username: string): Promise<any> {
    const url = this.config.getUserUrl('userByUsername', {
      username: username,
    });
    const user = await this.makeGetRequest(url);
    this.logger.debug('Found user by email:', user[0]);
    return user;
  }

  private async checkIfUserExists(
    username: string,
    email: string,
  ): Promise<{ exists: boolean; reason?: string }> {
    try {
      const [usersByUsername, usersByEmail] = await Promise.all([
        this.findUserByUsername(username),
        this.findUserByEmail(email),
      ]);

      if (usersByUsername.length > 0) {
        return { exists: true, reason: 'Username already exists in Keycloak' };
      }

      if (usersByEmail.length > 0) {
        return { exists: true, reason: 'Email already exists in Keycloak' };
      }

      return { exists: false };
    } catch (error) {
      this.handleError(error, 'user');
    }
  }

  private async createPayload(
    payload: KeycloakPayload,
  ): Promise<KeycloakPayload | any> {
    const url = this.config.getUserUrl('users');

    try {
      if (!payload.username || !payload.email) {
        throw new HttpException(
          'Username and email are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      payload.groups = payload.groups ?? [];

      payload.realmRoles = payload.realmRoles ?? [];

      if (payload.credentials && payload.credentials.length > 0) {
        payload.credentials = payload.credentials.map((cred) => ({
          type: cred.type,
          value: cred.value,
          temporary: cred.temporary ?? false,
        }));
      }

      const userExists = await this.checkIfUserExists(
        payload.username,
        payload.email,
      );
      if (userExists.exists) {
        this.logger.warn(`User creation failed: ${userExists.reason}`);
        throw new HttpException(userExists.reason, HttpStatus.CONFLICT);
      }

      const data = this.buildKeycloakPayload(payload);

      const userCreationResponse = await this.makePostRequest(url, data);

      if (userCreationResponse) {
        return this.responseI18nService.create(userCreationResponse, 'USER');
      } else {
        const user = await this.findUserByEmail(data.email);
        if (user) {
          return this.responseI18nService.create(user, 'USER');
        } else {
          return this.responseI18nService.badRequest('GENERAL.FAILED', 'USER');
        }
      }
    } catch (error) {
      this.logger.error('Error creating user in Keycloak', error);

      if (error.response && error.response.data) {
        this.logger.error(
          `Keycloak Error Response: ${JSON.stringify(error.response.data)}`,
        );
      }

      if (error.response?.data?.errorMessage) {
        throw new HttpException(
          error.response.data.errorMessage,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw error;
    }
  }

  private async updatePayload(id: string, updateUserDto: KeycloakPayload) {
    const url = this.config.getUserUrl('userById', { userId: id });
    try {
      const payload = updateUserDto;

      const data = this.buildKeycloakPayload(payload);

      const userCreationResponse = await this.makePutRequest(url, payload);

      if (!userCreationResponse) {
        const user = await this.findUserByEmail(payload.email);
        return this.responseI18nService.update(user, 'USER');
      } else {
        return this.responseI18nService.badRequest('GENERAL.FAILED', 'USER');
      }
    } catch (error) {
      this.logger.error(
        `Failed to update user in Keycloak - data: ${error}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }
}

export type FormattedUser = {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};
