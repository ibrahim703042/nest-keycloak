import { Injectable, OnModuleInit } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import { ResponseData } from 'src/helpers/response-helpers/utils';
import {
  CreateClientRoleDto,
  RemoveClientRoleDto,
} from '../dto/create-client.dto';
import { UpdateClientRoleDto } from '../dto/update-client.dto';
import { ClientService } from './client.service';
import { ApiResponse } from 'src/helpers/translate/types/i18n.types';
import { RealmRoleStatic } from 'src/modules/keycloak/constants/kc.enum';

@Injectable()
export class ClientRoleService
  extends KeycloakBaseService
  implements OnModuleInit
{
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;

  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly clientService: ClientService,
    private readonly responseI18nService: ResponseI18nService,
  ) {
    super(httpService, config, ClientRoleService.name);
  }

  async onModuleInit() {
    const requiredRoles = Object.values(RealmRoleStatic);
    await this.ensureRolesExist(requiredRoles, this.clientId);
  }

  private async ensureRolesExist(roles: string[], clientId: string) {
    try {
      const url = this.config.getClientUrl('clientRoles', {
        clientId: clientId,
      });

      const existingRoles = await this.findAll(clientId);

      for (const role of roles) {
        const roleExists = existingRoles.data.some((r) => r.name === role);

        if (!roleExists) {
          const rolePayload = {
            clientId,
            name: role,
          };
          await this.makePostRequest(url, rolePayload);

          this.logger.log(`Role '${role}' created in Keycloak.`);
        } else {
          this.logger.log(`Role '${role}' already exists in Keycloak.`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to ensure roles exist in Keycloak', error);
    }
  }

  async create(dto: CreateClientRoleDto) {
    const client = await this.clientService.findByClientId(dto.clientId);
    const id = client.data.id;

    const url = this.config.getClientUrl('clientRoles', { clientId: id });

    try {
      // Remove clientId from the DTO before sending it to Keycloak
      const { clientId, ...rolePayload } = dto;

      const createResponse = await this.makePostRequest(url, rolePayload);

      if (!createResponse) {
        const roleDetails = await this.getByName(id, dto.name);
        return this.responseI18nService.create(roleDetails, 'ROLE');
      } else {
        return this.responseI18nService.badRequest('GENERAL.FAILED', 'ROLE');
      }
    } catch (error) {
      this.logger.error(
        `Failed to create role in Keycloak - roleName: ${dto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findAll(clientId: string): Promise<ApiResponse<Kc_Role>> {
    const client = await this.clientService.findByClientId(clientId);
    const id = client.data.id;

    const url = this.config.getClientUrl('clientRoles', { clientId: id });
    try {
      const roles = await this.makeGetRequest<Kc_Role[]>(url);
      return this.responseI18nService.fetchAll(roles, 'ROLE');
    } catch (error) {
      this.logger.error(
        `Failed to fetch roles for clientId: ${clientId}`,
        error,
      );
      this.handleError(error, url);
    }
  }

  async getByName(clientId: string, roleName: string): Promise<Kc_Role[]> {
    const url =
      this.config.getClientUrl('clientRoles', { clientId }) + `/${roleName}`;

    try {
      return await this.makeGetRequest(url);
    } catch (error) {
      this.logger.error(
        `Failed to fetch role: ${roleName} for clientId: ${clientId}`,
        error,
      );
      return null;
    }
  }

  async getRoleByName(
    clientId: string,
    roleName: string,
  ): Promise<ResponseData<Kc_Role> | any> {
    const client = await this.clientService.findByClientId(clientId);
    const id = client.data.id;
    const url =
      this.config.getClientUrl('clientRoles', { clientId: id }) +
      `/${roleName}`;

    try {
      const response = await this.makeGetRequest(url);

      if (!response) {
        return this.responseI18nService.notFound('ROLE');
      }

      return this.responseI18nService.success(response, 'ROLE');
    } catch (error) {
      this.logger.error(
        `Failed to retrieve role details - roleName: ${roleName}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async update(roleId: string, dto: UpdateClientRoleDto) {
    const client = await this.clientService.findByClientId(dto.clientId);
    const id = client.data.id;

    const url =
      this.config.getClientUrl('clientRoles', { clientId: id }) + `/${roleId}`;

    try {
      // Remove clientId from the DTO before sending it to Keycloak
      const { clientId, ...rolePayload } = dto;

      const updateResponse = await this.makePutRequest(url, rolePayload);

      if (!updateResponse) {
        const roleDetails = await this.getByName(id, dto.name);
        return this.responseI18nService.update(roleDetails, 'ROLE');
      } else {
        return this.responseI18nService.badRequest(
          'GENERAL.UPDATE_FAILED',
          'ROLE',
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update role in Keycloak - roleName: ${dto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async remove(dto: RemoveClientRoleDto) {
    const client = await this.clientService.findByClientId(dto.clientId);
    console.log('Id', client);
    const id = client.data.id;

    const url =
      this.config.getClientUrl('clientRoles', { clientId: id }) +
      `/${dto.roleId}`;

    try {
      const deleted = await this.makeDeleteRequest(url, undefined);

      return this.responseI18nService.delete(deleted, 'ROLE');
    } catch (error) {
      this.logger.error(
        `Failed to delete role in Keycloak - roleName: ${dto.roleId}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }
}
