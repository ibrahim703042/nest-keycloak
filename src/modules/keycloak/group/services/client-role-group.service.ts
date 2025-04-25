import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { ClientService } from 'src/modules/keycloak/client/services/client.service';
import {
  AssignClientRoleToGroupDto,
  CreateClientRoleToGroupDto,
} from '../dto/create-group.dto';
import { GroupService } from './group.service';
import { ClientRoleService } from 'src/modules/keycloak/client/services/client-role.service';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import { CreateRoleMappingDto } from 'src/modules/keycloak/role/dto/create-role.dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { FilterClientDto } from 'src/modules/keycloak/filter/kc-filter';

@Injectable()
export class ClientRoleGroupService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly clientService: ClientService,
    private readonly clientRoleService: ClientRoleService,
    private readonly groupService: GroupService,
    private readonly responseI18nService: ResponseI18nService,
  ) {
    super(httpService, config, ClientRoleGroupService.name);
  }

  async create(dto: AssignClientRoleToGroupDto): Promise<Kc_Role[] | any> {
    const clientId = await this.getClientId(dto.clientId);
    const roles = await this.fetchRoles(clientId, dto.roleNames);
    const payload = this.prepareRoleMappings(roles);
    return this.assignRolesToGroup(dto.groupName, clientId, payload);
  }

  async findAllRoleMappings(dto: FilterClientDto): Promise<any> {
    try {
      const groupsResponse = await this.groupService.findAll();
      const groups = groupsResponse?.data ?? groupsResponse;

      if (!Array.isArray(groups) || groups.length === 0) {
        throw new Error('No groups found.');
      }

      const roleMappingPromises = groups.map(async (group) => {
        const groupDto = { ...dto, groupName: group.name };

        const roleMappings = await this.clientRoleMappingInGroup(groupDto);

        return {
          groupId: group.id,
          name: group.name,
          roleMappings: roleMappings.data,
        };
      });

      const allRoleMappings = await Promise.all(roleMappingPromises);

      return this.responseI18nService.fetchAll(allRoleMappings, 'ROLE');
    } catch (error) {
      console.error('Error in findAllRoleMappings:', error);
      throw new Error(`Failed to fetch role mappings: ${error.message}`);
    }
  }

  async clientRoleMappingInGroup(
    dto: CreateClientRoleToGroupDto,
  ): Promise<Kc_Role[] | any> {
    const clientId = await this.getClientId(dto.clientId);
    const groupId = await this.getGroupId(dto.groupName);
    const url = this.config.getGroupUrl('clientRoles', {
      groupId,
      clientId,
    });
    const roles = await this.makeGetRequest<Kc_Role[]>(url);
    return this.responseI18nService.fetchAll(roles, 'ROLE');
    // return this.responseI18nService.fetchAll(roles, 'ROLE');
  }

  async availableClientRoleInGroup(
    dto: CreateClientRoleToGroupDto,
  ): Promise<Kc_Role[] | any> {
    const clientId = await this.getClientId(dto.clientId);
    const groupId = await this.getGroupId(dto.groupName);
    const url = this.config.getGroupUrl('clientRoleGroupAvailable', {
      groupId,
      clientId,
    });
    const roles = await this.makeGetRequest<Kc_Role[]>(url);
    return this.responseI18nService.fetchAll(roles, 'ROLE');
  }

  async update(dto: AssignClientRoleToGroupDto): Promise<Kc_Role[]> {
    const clientId = await this.getClientId(dto.clientId);
    const roles = await this.fetchRoles(clientId, dto.roleNames);
    const payload = this.prepareRoleMappings(roles);
    const existingRoles = await this.availableClientRoleInGroup({
      clientId,
      groupName: dto.groupName,
    });
    const finalRoleMappings = this.mergeRoleMappings(existingRoles, payload);
    return this.assignRolesToGroup(dto.groupName, clientId, finalRoleMappings);
  }

  async remove(
    dto: CreateClientRoleToGroupDto,
    roleDto: CreateRoleMappingDto,
  ): Promise<Kc_Role[] | any> {
    try {
      const clientId = await this.getClientId(dto.clientId);
      console.log('ClientId :', clientId);
      const roles = await this.fetchRoles(clientId, roleDto.roleName);
      const rolesToRemove = roles.filter((role) =>
        roleDto.roleName.includes(role.name),
      );
      const groupId = await this.getGroupId(dto.groupName);
      const url = this.config.getGroupUrl('clientRoles', {
        groupId,
        clientId,
      });

      if (rolesToRemove.length === 0) {
        console.log('No roles to remove.');
        return this.responseI18nService.delete([], 'ROLE');
      }

      const payload = rolesToRemove.map((role) => ({
        id: role.id,
        name: role.name,
      }));

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      await this.makeDeleteRequest(url, payload);
      return this.responseI18nService.delete(rolesToRemove, 'ROLE');
    } catch (error) {
      console.error('Error removing roles:', error);
      throw new Error(`Failed to remove roles: ${error.message}`);
    }
  }

  private async getClientId(clientId: string): Promise<string> {
    const client = await this.clientService.findByClientId(clientId);
    return client.data.id;
  }

  private async getGroupId(groupName: string): Promise<string> {
    const group = await this.groupService.getGroupByName(groupName);
    return group.data.id;
  }

  private mergeRoleMappings(
    existingRoleMappings: Kc_Role[],
    payload: Kc_Role[],
  ): Kc_Role[] {
    const merged = [...existingRoleMappings];
    payload.forEach((role) => {
      if (!merged.some((existingRole) => existingRole.id === role.id)) {
        merged.push(role);
      }
    });
    return merged;
  }

  private prepareRoleMappings(roles: Kc_Role[]): Kc_Role[] {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      composite: role.composite,
      clientRole: role.clientRole,
    }));
  }

  private async fetchRoles(
    clientId: string,
    roleNames: string[],
  ): Promise<Kc_Role[]> {
    const rolePromises = roleNames.map(async (roleName) => {
      const role = await this.clientRoleService.getByName(clientId, roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found.`);
      }
      return role;
    });
    return Promise.all(rolePromises).then((results) => results.flat());
  }

  private async assignRolesToGroup(
    groupName: string,
    clientId: string,
    roleMappings: Kc_Role[],
  ): Promise<Kc_Role[] | any> {
    try {
      const groupId = await this.getGroupId(groupName);
      const url = this.config.getGroupUrl('clientRoles', {
        groupId,
        clientId,
      });

      console.log('Sending payload:', JSON.stringify(roleMappings, null, 2));
      const response = await this.makePostRequest(url, roleMappings);

      if (!response) {
        // map each role to get id and name
        const roles = roleMappings.map((role) => ({
          id: role.id,
          name: role.name,
        }));
        // find roles before returning
        const roleDetails = await Promise.all(
          roles.map((role) =>
            this.clientRoleService.getByName(clientId, role.name),
          ),
        );

        return this.responseI18nService.create(roleDetails, 'ROLE');
      } else {
        return this.responseI18nService.badRequest('GENERAL.FAILED', 'ROLE');
      }
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw new Error(`Failed to assign roles`);
    }
  }
}
