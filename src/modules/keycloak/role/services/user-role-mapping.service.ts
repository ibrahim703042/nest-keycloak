import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { FilterRoleDto } from 'src/utils/enum/filter/filter.dto';
import {
  CreateRoleMappingDto,
  CreateUserRoleMappingDto,
} from '../dto/create-role.dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { Kc_Role, Kc_User } from 'src/helpers/keycloak-config/types/declare';
import { UserService } from 'src/modules/keycloak/user/services/user.service';
import { GroupUserMappingService } from 'src/modules/keycloak/user/services/group-user-mapping.service';
import { ClientService } from 'src/modules/keycloak/client/services/client.service';

@Injectable()
export class UserRoleMappingService extends KeycloakBaseService {
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;

  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly userService: UserService,
    private readonly userGroupMappingService: GroupUserMappingService,
    private readonly clientService: ClientService,
  ) {
    super(httpService, config, UserRoleMappingService.name);
  }

  async create(dto: CreateUserRoleMappingDto): Promise<Kc_Role[]> {
    const roles = await this.fetchRoles(dto.roleName);
    const roleMappings = this.prepareRoleMappings(roles);
    const userId = dto.userId;
    return this.assignRolesToUser(userId, roleMappings);
  }

  async update(userId: string, dto: CreateRoleMappingDto): Promise<Kc_Role[]> {
    const roles = await this.fetchRoles(dto.roleName);
    const newRoleMappings = this.prepareRoleMappings(roles);

    const existingRoleMappings = await this.findRoleMappingsForUser(userId);

    const finalRoleMappings = this.mergeRoleMappings(
      existingRoleMappings,
      newRoleMappings,
    );

    return this.assignRolesToUser(userId, finalRoleMappings);
  }

  async findAllRoleMappings(pageOptionsDto: PageOptionsDto): Promise<any> {
    try {
      const usersResponse = await this.userService.findAll();
      const users = usersResponse?.data ?? usersResponse;

      if (!Array.isArray(users) || users.length === 0) {
        throw new Error('No users found.');
      }

      const roleMappingPromises = users.map(async (user) => {
        const roleMappings = await this.findRoleMappingsForUser(user.id);
        return {
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roleMappings,
        };
      });

      const allRoleMappings = await Promise.all(roleMappingPromises);

      return this.responseI18nService.fetchWithPagination(
        allRoleMappings,
        allRoleMappings.length,
        pageOptionsDto,
        'ROLE',
      );
    } catch (error) {
      console.error('Error in findAllRoleMappings:', error);
      throw new Error(`Failed to fetch role mappings: ${error.message}`);
    }
  }

  async findUsersByRole(filter: FilterRoleDto): Promise<any> {
    const url = this.config.getUrl('role-users', { roleName: filter.role });

    try {
      const users = await this.makeGetRequest<Kc_Role[]>(url);
      return this.responseI18nService.success(users, 'ROLE');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.success([], 'ROLE');
      }

      this.logger.error(
        `Failed to retrieve users assigned to role: ${filter.role}`,
        error.response?.data || error.message,
      );

      return this.responseI18nService.success([], 'ROLE');
    }
  }

  async findRoleMappingsForUser(userId: string): Promise<Kc_Role[]> {
    const urlRoleMappings = this.config.getUrl('findRoleMappings', { userId });
    const roleMappings = await this.makeGetRequest<Kc_Role[]>(urlRoleMappings);
    return roleMappings;
  }

  async remove(
    userId: string,
    dto: CreateRoleMappingDto,
  ): Promise<Kc_Role[] | any> {
    try {
      const roles = await this.fetchRoles(dto.roleName);

      const rolesToRemove = roles.filter((role) =>
        dto.roleName.includes(role.name),
      );

      if (rolesToRemove.length === 0) {
        console.log('No roles to remove.');
        return this.responseI18nService.delete([], 'ROLE');
      }

      const payload = rolesToRemove.map((role) => ({
        id: role.id,
        name: role.name,
      }));

      const urlRoleMapping = this.config.getUrl('findRoleMappings', { userId });

      const response = await this.makeDeleteRequest(urlRoleMapping, payload);

      console.log('Role removal response:', response);

      return this.responseI18nService.delete(rolesToRemove, 'ROLE');
    } catch (error) {
      console.error('Error removing roles:', error);
      throw new Error(`Failed to remove roles: ${error.message}`);
    }
  }

  async fetchRoles(roleNames: string[]): Promise<Kc_Role[]> {
    const rolePromises = roleNames.map(async (roleName) => {
      const urlRole = this.config.getUrl('roleByName', { roleName });
      const role: Kc_Role = await this.makeGetRequest<Kc_Role>(urlRole);
      if (!role) {
        throw new Error(`Role ${roleName} not found.`);
      }
      return role;
    });

    return Promise.all(rolePromises);
  }

  private prepareRoleMappings(roles: Kc_Role[]): Kc_Role[] {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      composite: role.composite,
      clientRole: role.clientRole,
    }));
  }

  private async assignRolesToUser(
    userId: string,
    roleMappings: Kc_Role[],
  ): Promise<Kc_Role[] | any> {
    try {
      const urlRoleMapping = this.config.getUrl('assignRealmRole', { userId });

      console.log('Sending payload:', JSON.stringify(roleMappings, null, 2));

      const response = await this.makePostRequest(urlRoleMapping, roleMappings);

      return {
        message: `Roles assigned successfully: ${roleMappings.map((role) => role.name).join(', ')}`,
        data: response,
      };
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw new Error(`Failed to assign roles`);
    }
  }

  private mergeRoleMappings(
    existingRoleMappings: Kc_Role[],
    newRoleMappings: Kc_Role[],
  ): Kc_Role[] {
    const merged = [...existingRoleMappings];

    newRoleMappings.forEach((newRole) => {
      if (!merged.some((existingRole) => existingRole.id === newRole.id)) {
        merged.push(newRole);
      }
    });

    return merged;
  }

  // ==================================== Authentication ============================================

  private async getGroupsByClientRole(roleName: string): Promise<any> {
    const client = await this.clientService.findByClientId(this.clientId);
    const id = client.data.id;

    const url = this.config.getClientUrl('findUsersGroupByRole', {
      clientId: id,
      roleName: roleName,
    });

    try {
      return await this.makeGetRequest(url);
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  private async getUsersByGroups(groupIds: string[]): Promise<any[]> {
    // Run all group member requests in parallel
    const userPromises = groupIds.map((groupId) =>
      this.userGroupMappingService
        .findGroupMembers(groupId)
        .then((response) => response.data)
        .catch((error) => {
          this.logger.error(
            `Failed to fetch members for group ${groupId}`,
            error,
          );
          return [];
        }),
    );

    // Wait for all requests to complete and flatten the results
    const usersArrays = await Promise.all(userPromises);
    return usersArrays.flat();
  }

  async findUsersByGroupsAndRole(filter: FilterRoleDto): Promise<any> {
    try {
      const groups = await this.getGroupsByClientRole(filter.role);
      const groupIds = groups.map((group) => group.name);

      if (!groupIds.length) {
        return this.responseI18nService.success([], 'USER');
      }

      const users = await this.getUsersByGroups(groupIds);
      const uniqueUsers = this.removeDuplicateUsers(users);

      return this.responseI18nService.success(uniqueUsers, 'USER');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.success([], 'USER');
      }

      this.logger.error(
        `Failed to retrieve users assigned to role: ${filter.role}`,
        error.response?.data || error.message,
      );
      return this.responseI18nService.success([], 'USER');
    }
  }

  private removeDuplicateUsers(users: any[]): any[] {
    return Array.from(new Map(users.map((user) => [user.id, user])).values());
  }
}
