import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { FilterRoleDto } from 'src/utils/enum/filter/filter.dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import { CreateGroupRoleMappingDto } from '../dto/create-group.dto';
import { CreateRoleMappingDto } from 'src/modules/keycloak/role/dto/create-role.dto';
import { UserService } from 'src/modules/keycloak/user/services/user.service';

@Injectable()
export class GroupRoleMappingService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly userService: UserService,
  ) {
    super(httpService, config, GroupRoleMappingService.name);
  }

  async create(dto: CreateGroupRoleMappingDto) {
    // fetch exist roles
    const roles = await this.fetchRoles(dto.roleName);
    // Prepare the role mappings payload
    const roleMappings = this.prepareRoleMappings(roles);
    const userId = dto.groupId;
    return this.assignRolesToUser(userId, roleMappings);
  }

  async update(userId: string, dto: CreateRoleMappingDto) {
    const roles = await this.fetchRoles(dto.roleName);
    const newRoleMappings = this.prepareRoleMappings(roles);

    // checked existing roles based on userId
    const existingRoleMappings: any =
      await this.findRoleMappingsForUser(userId);

    // prepared merge to update
    const finalRoleMappings = this.mergeRoleMappings(
      existingRoleMappings.data,
      newRoleMappings,
    );

    return this.assignRolesToUser(userId, finalRoleMappings);
  }

  async findAllRoleMappings(pageOptionsDto: PageOptionsDto) {
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
        'GROUP',
      );
    } catch (error) {
      console.error('Error in findAllRoleMappings:', error);
      throw new Error(`Failed to fetch role mappings: ${error.message}`);
    }
  }

  async findUsersByRole(filter: FilterRoleDto) {
    const url = this.config.getUrl('role-users', { roleName: filter.role });

    try {
      const users = await this.makeGetRequest(url);
      return this.responseI18nService.success(users, 'GROUP');
    } catch (error) {
      if (error.response?.status === 404) {
        return this.responseI18nService.success([], 'GROUP');
      }

      this.logger.error(
        `Failed to retrieve users assigned to role: ${filter.role}`,
        error.response?.data || error.message,
      );

      return this.responseI18nService.success([], 'GROUP');
    }
  }

  async findRoleMappingsForUser(userId: string): Promise<any> {
    const urlRoleMappings = this.config.getUrl('findRoleMappings', { userId });
    const roleMappings = await this.makeGetRequest(urlRoleMappings);
    return this.responseI18nService.success(roleMappings, 'GROUP');
  }

  async remove(userId: string, dto: CreateRoleMappingDto) {
    try {
      // Fetch all roles
      const roles = await this.fetchRoles(dto.roleName);

      // Filter roles to remove based on the role names provided in dto.roleName
      const rolesToRemove = roles.filter((role) =>
        dto.roleName.includes(role.name),
      );

      // If no roles to remove, return early
      if (rolesToRemove.length === 0) {
        console.log('No roles to remove.');
        return this.responseI18nService.delete({}, 'GROUP');
      }

      // Prepare the payload for removing roles
      const payload = rolesToRemove.map((role) => ({
        id: role.id,
        name: role.name,
      }));

      // console.log('Sending payload:', JSON.stringify(payload, null, 2));

      // Remove roles from the user
      const urlRoleMapping = this.config.getUrl('findRoleMappings', {
        userId: userId,
      });

      const response = await this.makeDeleteRequest(urlRoleMapping, payload);

      console.log('Role removal response:', response);

      return this.responseI18nService.delete(rolesToRemove, 'GROUP');
    } catch (error) {
      console.error('Error removing roles:', error);
      throw new Error(`Failed to remove roles: ${error.message}`);
    }
  }

  async fetchRoles(roleNames: string[]): Promise<any[]> {
    const rolePromises = roleNames.map(async (roleName) => {
      const urlRole = this.config.getUrl('roleByName', {
        roleName: roleName,
      });
      const role: Kc_Role = await this.makeGetRequest(urlRole);
      if (!role) {
        throw new Error(`Role ${roleName} not found.`);
      }
      return {
        id: role.id,
        name: role.name,
        composite: role.composite,
        clientRole: role.clientRole,
      };
    });

    return Promise.all(rolePromises);
  }

  // Prepare role mappings payload
  private prepareRoleMappings(roles: any[]) {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      composite: role.composite,
      clientRole: role.clientRole,
    }));
  }

  // Assign roles to a user
  private async assignRolesToUser(groupId: string, roleMappings: any[]) {
    try {
      // Prepare the URL for assigning roles
      const urlRoleMapping = this.config.getGroupUrl('groupRoleMapping', {
        groupId: groupId,
        roleName: roleMappings,
      });

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

  // Merge existing role mappings with new role mappings
  private mergeRoleMappings(
    existingRoleMappings: any[],
    newRoleMappings: any[],
  ) {
    const merged = [...existingRoleMappings];

    newRoleMappings.forEach((newRole) => {
      const exists = existingRoleMappings.some(
        (existingRole) => existingRole.id === newRole.id,
      );
      if (!exists) {
        merged.push(newRole);
      }
    });

    return merged;
  }
}
