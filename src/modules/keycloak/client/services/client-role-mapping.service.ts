import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { Kc_Role } from 'src/helpers/keycloak-config/types/declare';
import {
  CreateRoleMappingDto,
  CreateUserRoleMappingDto,
} from '../../role/dto/create-role.dto';

@Injectable()
export class ClientRoleMappingService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
  ) {
    super(httpService, config, ClientRoleMappingService.name);
  }

  // ==================== Realm Roles ====================
  async create(dto: CreateUserRoleMappingDto) {
    const roles = await this.fetchRoles(dto.roleName);
    const roleMappings = this.prepareRoleMappings(roles);
    const userId = dto.userId;
    return this.assignRolesToUser(userId, roleMappings);
  }

  async update(userId: string, dto: CreateRoleMappingDto) {
    const roles = await this.fetchRoles(dto.roleName);
    const newRoleMappings = this.prepareRoleMappings(roles);
    const existingRoleMappings: any =
      await this.findRoleMappingsForUser(userId);
    const finalRoleMappings = this.mergeRoleMappings(
      existingRoleMappings.data,
      newRoleMappings,
    );
    return this.assignRolesToUser(userId, finalRoleMappings);
  }

  async remove(userId: string, dto: CreateRoleMappingDto) {
    const roles = await this.fetchRoles(dto.roleName);
    const rolesToRemove = roles.filter((role) =>
      dto.roleName.includes(role.name),
    );
    if (rolesToRemove.length === 0) {
      return this.responseI18nService.delete({}, 'ROLE');
    }
    const payload = rolesToRemove.map((role) => ({
      id: role.id,
      name: role.name,
    }));
    const urlRoleMapping = this.config.getUrl('findRoleMappings', { userId });
    const response = await this.makeDeleteRequest(urlRoleMapping, payload);
    return this.responseI18nService.delete(rolesToRemove, 'ROLE');
  }

  // ==================== Client Roles ====================
  async createClientRoles(
    userId: string,
    clientId: string,
    dto: CreateRoleMappingDto,
  ) {
    const roles = await this.fetchClientRoles(clientId, dto.roleName);
    const roleMappings = this.prepareRoleMappings(roles);
    return this.assignClientRolesToUser(userId, clientId, roleMappings);
  }

  async updateClientRoles(
    userId: string,
    clientId: string,
    dto: CreateRoleMappingDto,
  ) {
    const roles = await this.fetchClientRoles(clientId, dto.roleName);
    const newRoleMappings = this.prepareRoleMappings(roles);
    const existingRoleMappings: any = await this.findClientRoleMappingsForUser(
      userId,
      clientId,
    );
    const finalRoleMappings = this.mergeRoleMappings(
      existingRoleMappings.data,
      newRoleMappings,
    );
    return this.assignClientRolesToUser(userId, clientId, finalRoleMappings);
  }

  async removeClientRoles(
    userId: string,
    clientId: string,
    dto: CreateRoleMappingDto,
  ) {
    const roles = await this.fetchClientRoles(clientId, dto.roleName);
    const rolesToRemove = roles.filter((role) =>
      dto.roleName.includes(role.name),
    );
    if (rolesToRemove.length === 0) {
      return this.responseI18nService.delete({}, 'ROLE');
    }
    const payload = rolesToRemove.map((role) => ({
      id: role.id,
      name: role.name,
    }));
    // const urlRoleMapping = this.config.getUrl('findClientRoleMappings', { userId, clientId });
    // const response = await this.makeDeleteRequest(urlRoleMapping, payload);
    return this.responseI18nService.delete(rolesToRemove, 'ROLE');
  }

  // ==================== Helper Methods ====================
  async fetchRoles(roleNames: string[]): Promise<any[]> {
    const rolePromises = roleNames.map(async (roleName) => {
      const urlRole = this.config.getUrl('roleByName', { roleName });
      const role: Kc_Role = await this.makeGetRequest(urlRole);
      if (!role) throw new Error(`Role ${roleName} not found.`);
      return {
        id: role.id,
        name: role.name,
        composite: role.composite,
        clientRole: role.clientRole,
      };
    });
    return Promise.all(rolePromises);
  }

  async fetchClientRoles(
    clientId: string,
    roleNames: string[],
  ): Promise<any[]> {
    const rolePromises = roleNames.map(async (roleName) => {
      //   const urlRole = this.config.getUrl('clientRoleByName', { clientId, roleName });
      const urlRole = '';
      const role: Kc_Role = await this.makeGetRequest(urlRole);
      if (!role) throw new Error(`Client role ${roleName} not found.`);
      return {
        id: role.id,
        name: role.name,
        composite: role.composite,
        clientRole: role.clientRole,
      };
    });
    return Promise.all(rolePromises);
  }

  private prepareRoleMappings(roles: any[]) {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      composite: role.composite,
      clientRole: role.clientRole,
    }));
  }

  private async assignRolesToUser(userId: string, roleMappings: any[]) {
    const urlRoleMapping = this.config.getUrl('assignRealmRole', { userId });
    const response = await this.makePostRequest(urlRoleMapping, roleMappings);
    return {
      message: `Roles assigned successfully: ${roleMappings.map((role) => role.name).join(', ')}`,
      data: response,
    };
  }

  private async assignClientRolesToUser(
    userId: string,
    clientId: string,
    roleMappings: any[],
  ) {
    // const urlRoleMapping = this.config.getUrl('assignClientRole', { userId, clientId });
    const urlRoleMapping = '';
    const response = await this.makePostRequest(urlRoleMapping, roleMappings);
    return {
      message: `Client roles assigned successfully: ${roleMappings.map((role) => role.name).join(', ')}`,
      data: response,
    };
  }

  private async findRoleMappingsForUser(userId: string): Promise<any> {
    const urlRoleMappings = this.config.getUrl('findRoleMappings', { userId });
    const roleMappings = await this.makeGetRequest(urlRoleMappings);
    return this.responseI18nService.success(roleMappings, 'ROLE');
  }

  private async findClientRoleMappingsForUser(
    userId: string,
    clientId: string,
  ): Promise<any> {
    // const urlRoleMappings = this.config.getUrl('findClientRoleMappings', { userId, clientId });
    const urlRoleMappings = '';
    const roleMappings = await this.makeGetRequest(urlRoleMappings);
    return this.responseI18nService.success(roleMappings, 'ROLE');
  }

  private mergeRoleMappings(
    existingRoleMappings: any[],
    newRoleMappings: any[],
  ) {
    const merged = [...existingRoleMappings];
    newRoleMappings.forEach((newRole) => {
      if (
        !existingRoleMappings.some(
          (existingRole) => existingRole.id === newRole.id,
        )
      ) {
        merged.push(newRole);
      }
    });
    return merged;
  }
}
