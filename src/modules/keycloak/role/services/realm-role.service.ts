import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { FilterRoleDto } from 'src/utils/enum/filter/filter.dto';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import { UserService } from 'src/modules/keycloak/user/services/user.service';

@Injectable()
export class RealmRoleService extends KeycloakBaseService {
  // private readonly logger = new Logger(RoleService.name);

  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly userService: UserService,
  ) {
    super(httpService, config, RealmRoleService.name);
  }

  async create(createRoleDto: CreateRoleDto) {
    const url = this.config.getUrl('roles');
    try {
      const payload = { name: createRoleDto.name };
      const data = await this.makePostRequest<Kc_Role>(url, payload);
      console.log('Keycloak Response:', data);

      // If no data is returned, fetch it manually
      const role = data?.id ? data : await this.findOne(createRoleDto.name);

      return this.responseI18nService.create(role, 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to create role in Keycloak - RealmRoleName: ${createRoleDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findAll() {
    const url = this.config.getUrl('roles');
    try {
      const data = await this.makeGetRequest<Kc_Role[]>(url);

      return this.responseI18nService.success(data, 'USER');
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, url);
    }
  }

  async assignedUsersToRealmRole(filter: FilterRoleDto) {
    const url = this.config.getUrl('role-users', { roleName: filter.role });

    try {
      const users = await this.makeGetRequest(url);
      return this.responseI18nService.success(users, 'USER');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.success([], 'USER');
      }

      this.logger.error(
        `Failed to retrieve users assigned to role: ${filter.role}`,
        error.response?.data || error.message,
      );

      return this.responseI18nService.success([], 'USER');

      // this.handleError(error, url);
    }
  }

  async getAssignedUsersToRealmRole(filter: FilterRoleDto) {
    const url = this.config.getUrl('role-users', { roleName: filter.role });

    try {
      const users = await this.makeGetRequest(url);
      return this.responseI18nService.success(users, 'USER');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.success([], 'USER');
      }

      this.logger.error(
        `Failed to retrieve users assigned to role: ${filter.role}`,
        error.response?.data || error.message,
      );

      return this.responseI18nService.success([], 'USER');

      // this.handleError(error, url);
    }
  }

  async findOne(id: string) {
    const url = this.config.getUrl('roles', { roleId: id });
    try {
      const data = await this.makeGetRequest<Kc_Role>(url);
      console.log('Data :', data);

      return this.responseI18nService.create(data, 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to find group in Keycloak - RoleID: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const url = this.config.getUrl('realm', { roleId: id });
    try {
      const payload = { name: updateRoleDto.name };

      const data = await this.makePutRequest<Kc_Role>(url, payload);

      return this.responseI18nService.create(data, 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to create role in Keycloak - RealmRoleName: ${updateRoleDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async remove(id: string) {
    const url = this.config.getUrl('roles', { realmRoleId: id });
    try {
      const data = await this.makeDeleteRequest(url, undefined);

      return this.responseI18nService.delete(data, 'USER');

      // return { message: `Roles with ID ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(
        `Failed to delete group in Keycloak - RoleId: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }
}
