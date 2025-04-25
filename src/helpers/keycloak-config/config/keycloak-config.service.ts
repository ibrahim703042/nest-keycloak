import { Injectable } from '@nestjs/common';
import {
  ClientUrl,
  GroupUrl,
  UrlType,
  UserUrl,
  VarType,
} from '../types/endpoint.types';

@Injectable()
export class KeycloakConfigService {
  readonly baseUrl = process.env.KEYCLOAK_SERVER_URL;
  readonly realm = process.env.KEYCLOAK_REALM;
  readonly clientId = process.env.KEYCLOAK_CLIENT_ID_REGISTER_SERVICE;
  readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET_REGISTER_SERVICE;
  readonly grantType = process.env.KEYCLOAK_GRANT_TYPE_REGISTER_SERVICE;

  private readonly ADMIN_PATH = 'admin/realms';
  private readonly USER_ENDPOINT = '/users';

  private constructRealmUrl(endpoint: string): string {
    return `${this.baseUrl}/${this.ADMIN_PATH}/${this.realm}${endpoint}`;
  }

  get userGetUrl(): string {
    return this.constructRealmUrl(this.USER_ENDPOINT);
  }

  getAuthUrl(
    type: 'login' | 'logout' | 'revoke' | 'logout/{userId}',
    userId?: string,
  ): string {
    const baseRealmUrl = `${this.baseUrl}/realms/${this.realm}`;
    const loginUrl = `${baseRealmUrl}/protocol/openid-connect/token`;
    const logoutUrl = `${baseRealmUrl}/protocol/openid-connect/logout`;
    const revokeUrl = `${baseRealmUrl}/protocol/openid-connect/revoke`;
    const userLogoutUrl = `${baseRealmUrl}/users/${userId}/logout`;

    switch (type) {
      case 'login':
        return loginUrl;
      case 'logout':
        return logoutUrl;
      case 'revoke':
        return revokeUrl;
      case 'logout/{userId}':
        if (!userId) {
          throw new Error(
            'User ID must be provided for "logout/{userId}" type.',
          );
        }
        return userLogoutUrl;
      default:
        throw new Error(
          'Invalid type specified. Use "login", "logout", "revoke", or "logout/{userId}".',
        );
    }
  }

  getUrl(type: UrlType, variable?: VarType): string {
    const baseRealmUrl = `${this.baseUrl}/admin/realms/${this.realm}`;

    const urls = {
      roles: `${baseRealmUrl}/roles`,
      users: `${baseRealmUrl}/users`,
      realm: baseRealmUrl,
    };

    switch (type) {
      case 'roles':
        return urls.roles;

      case 'roleByName':
        if (Array.isArray(variable.roleName)) {
          return variable.roleName
            .map((role) => `${urls.roles}/${role}`)
            .join(', ');
        } else {
          return `${urls.roles}/${variable.roleName}`;
        }

      case 'role-users':
        return `${urls.roles}/${variable.roleName}/users`;

      case 'assignRealmRole':
        if (!variable.userId || !variable.roleName) {
          throw new Error('User ID and Role Name are required.');
        }
        return `${urls.users}/${variable.userId}/role-mappings/realm`;

      case 'findRoleMappings':
        if (!variable.userId) {
          throw new Error('User ID is required.');
        }
        return `${urls.users}/${variable.userId}/role-mappings/realm`;

      // Assign a **client role** to a user
      case 'assignClientRoleToUser':
        if (!variable.userId || !variable.clientId || !variable.roleName) {
          throw new Error('User ID, Client ID, and Role Name are required.');
        }
        return `${urls.users}/${variable.userId}/role-mappings/clients/${variable.clientId}`;

      // ➤ GROUP MEMBERSHIP
      case 'signUserToGroup':
        if (!variable.userId || !variable.groupId) {
          throw new Error('User ID and Group ID are required.');
        }
        return `${urls.users}/${variable.userId}/groups/${variable.groupId}`;

      // ➤ DEFAULT CASE
      default:
        throw new Error(`Invalid URL type: ${type}`);
    }
  }

  getUserUrl(type: UserUrl, variable?: VarType): string {
    const baseUserUrl = `${this.baseUrl}/admin/realms/${this.realm}/users`;

    switch (type) {
      case 'users':
        return baseUserUrl;

      case 'userById':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}`;

      case 'userByMail':
        if (!variable.userMail) throw new Error('User mail is required.');
        return `${baseUserUrl}?email=${variable.userMail}`;

      case 'userByUsername':
        if (!variable.username) throw new Error('User username is required.');
        return `${baseUserUrl}?username=${variable.username}`;

      case 'userRoles':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}/role-mappings/realm`;

      case 'removeUserTotp':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}/remove-totp`;

      case 'resetPassword':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}/reset-password`;

      case 'sendVerificationEmail':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}/send-verify-email`;

      case 'userGroups':
        if (!variable.userId) throw new Error('User ID is required.');
        return `${baseUserUrl}/${variable.userId}/groups`;

      case 'assignGroupToUser':
        if (!variable.userId) {
          throw new Error('User is required.');
        }
        if (!variable.groupId) {
          throw new Error('Group is required.');
        }
        return `${baseUserUrl}/${variable.userId}/groups/${variable.groupId}`;

      case 'findGroupByUser':
        if (!variable.userId) {
          throw new Error('User ID is required.');
        }
        return `${baseUserUrl}/${variable.userId}/groups`;

      case 'assignRoleToUser':
        if (!variable.userId || !variable.roleName) {
          throw new Error('User ID and Role Name are required.');
        }
        return `${baseUserUrl}/${variable.userId}/roles`;

      case 'userCredentials':
        if (!variable.userId || !variable.roleName) {
          throw new Error('User ID is required.');
        }
        return `${baseUserUrl}/${variable.userId}/user-credentials`;

      case 'userSessions':
        if (!variable.userId || !variable.roleName) {
          throw new Error('User ID is required.');
        }
        return `${baseUserUrl}/${variable.userId}/sessions`;

      default:
        throw new Error(`Invalid URL type: ${type}`);
    }
  }

  getClientUrl(type: ClientUrl, variable?: VarType): string {
    const baseClientUrl = `${this.baseUrl}/admin/realms/${this.realm}/clients`;

    switch (type) {
      case 'clients':
        return baseClientUrl;

      case 'clientById':
        if (!variable.id) throw new Error('Client ID is required.');
        return `${baseClientUrl}/${variable.id}`;

      case 'clientRoles':
        if (!variable.clientId) throw new Error('Client ID is required.');
        return `${baseClientUrl}/${variable.clientId}/roles`;

      case 'clientUsers':
        if (!variable.clientId) throw new Error('Client ID is required.');
        return `${baseClientUrl}/${variable.clientId}/users`;

      case 'clientSessions':
        if (!variable.clientId) throw new Error('Client ID is required.');
        return `${baseClientUrl}/${variable.clientId}/user-sessions`;

      // fetch to group client ID
      case 'findUsersGroupByRole':
        if (!variable.clientId) {
          throw new Error('client is required.');
        }
        if (!variable.roleName) {
          throw new Error('Group is required.');
        }
        return `${baseClientUrl}/${variable.clientId}/roles/${variable.roleName}/groups`;

      default:
        throw new Error(`Invalid URL type: ${type}`);
    }
  }

  getGroupUrl(type: GroupUrl, variable?: VarType): string {
    const baseGroupUrl = `${this.baseUrl}/admin/realms/${this.realm}/groups`;

    switch (type) {
      case 'groups':
        return baseGroupUrl;

      case 'groupById':
        if (!variable.groupId) throw new Error('Group ID is required.');
        return `${baseGroupUrl}/${variable.groupId}`;

      case 'groupByName':
        if (!variable.groupName) throw new Error('Group name is required.');
        return `${baseGroupUrl}?search=${variable.groupName}`;

      case 'groupMembers':
        if (!variable.groupId) throw new Error('Group ID is required.');
        return `${baseGroupUrl}/${variable.groupId}/members`;

      case 'groupRoleMapping':
        if (!variable.groupId) throw new Error('Group ID is required.');
        return `${baseGroupUrl}/${variable.groupId}/role-mappings/realm`;

      case 'available':
        if (!variable.groupId) throw new Error('Group ID is required.');
        return `${baseGroupUrl}/${variable.groupId}/role-mappings/realm/available`;

      case 'clientRoles':
        if (!variable.groupId) throw new Error('Group ID is required.');
        if (!variable.clientId) throw new Error('Client ID is required.');
        return `${baseGroupUrl}/${variable.groupId}/role-mappings/clients/${variable.clientId}`;

      case 'clientRoleGroupAvailable':
        if (!variable.groupId) throw new Error('Group ID is required.');
        if (!variable.clientId) throw new Error('Client ID is required.');
        return `${baseGroupUrl}/${variable.groupId}/role-mappings/clients/${variable.clientId}/available`;

      default:
        throw new Error(`Invalid URL type: ${type}`);
    }
  }
}
