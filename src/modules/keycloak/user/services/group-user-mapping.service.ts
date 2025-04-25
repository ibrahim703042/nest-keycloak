import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { Kc_Group, Kc_User } from 'src/helpers/keycloak-config/types/declare';
import { UserService } from './user.service';
import { GroupService } from 'src/modules/keycloak/group/services/group.service';
import {
  CreateUserToGroupDto,
  MapGroupToMultipleUserDto,
  MapUserToGroupDto,
} from 'src/modules/keycloak/group/dto/map-user-group.dto';
import { KcI18nService } from 'src/helpers/translate/server-response/kc-i18n-response.service';

@Injectable()
export class GroupUserMappingService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly Kc18nService: KcI18nService,
  ) {
    super(httpService, config, GroupUserMappingService.name);
  }

  async mapUserToGroup(dto: MapUserToGroupDto): Promise<Kc_Group[] | any> {
    try {
      const results = await this.assignUserToGroup(dto);

      await Promise.allSettled(
        results.map(({ payload, url }) =>
          this.makePutRequest<Kc_Group[]>(url, payload),
        ),
      );

      const details = await this.findGroupByUserId(dto.userId);

      return this.Kc18nService.assigned(
        'global.KEYCLOAK.USERS.ASSIGNED',
        'GROUP',
        details.data,
      );
    } catch (error) {
      console.error('Error mapping user to groups:', error);
      throw this.handleError(error);
    }
  }

  async mapUsersToGroup(
    dto: MapGroupToMultipleUserDto,
  ): Promise<Kc_Group[] | any> {
    const userIds = Array.isArray(dto.userId) ? dto.userId : [dto.userId];
    const payload: Kc_User[] = userIds.map((id) => ({ id }) as Kc_User);
    return this.assignUsersToGroup(dto.groupName, payload);
  }

  async findGroupByUserId(
    id: string,
  ): Promise<{ user: Kc_User; groups: Kc_Group[] } | any> {
    try {
      const [user, groups] = await Promise.all([
        this.userService.findUserById(id),
        this.makeGetRequest<Kc_Group[]>(
          this.config.getUserUrl('findGroupByUser', { userId: id }),
        ),
      ]);

      // Construct the user DTO
      const dto: Kc_User = {
        id: user.userId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      return this.responseI18nService.success(
        { ...dto, groupMappings: groups },
        'GROUP',
      );
    } catch (error) {
      console.error(`Error fetching user groups for ID ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async findMapUsersToGroup(): Promise<any> {
    try {
      const usersResponse = await this.userService.findAll();
      const users: Kc_User[] = usersResponse?.data ?? usersResponse;

      if (!Array.isArray(users) || users.length === 0) {
        throw new Error('No users found.');
      }

      const roleMappingPromises = users.map(async (user) => {
        const groupsResponse = await this.findGroupByUserId(user.id);
        const groups = groupsResponse?.data?.groupMappings ?? [];

        // Format group mappings or return default message if empty
        const formattedGroups =
          groups.length > 0
            ? groups.map((group) => ({
                id: group.id,
                name: group.name,
                path: group.path || '',
              }))
            : ['No groups assigned'];

        return {
          userId: user.id,
          userName: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          groupMappings: formattedGroups,
        };
      });

      const allRoleMappings = await Promise.allSettled(roleMappingPromises);

      const successfulMappings = allRoleMappings
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<any>).value);

      return this.responseI18nService.fetchAll(successfulMappings, 'ROLE');
    } catch (error) {
      console.error('Error in findMapUsersToGroup:', error);
      throw this.handleError(error);
    }
  }

  async findMapGroupToUsers(): Promise<any> {
    try {
      const groupsResponse = await this.groupService.findAll();
      const groups = groupsResponse?.data ?? groupsResponse;

      if (!Array.isArray(groups) || groups.length === 0) {
        throw new Error('No groups found.');
      }

      const usersMappingPromises = groups.map(async (group) => {
        const usersResponse = await this.findGroupMembers(group.name);
        const users = usersResponse?.data ?? [];

        const formattedUsers =
          users.length > 0
            ? users.map((user) => ({
                id: user.id,
                userName: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
              }))
            : ['No users assigned'];

        return {
          id: group.id,
          name: group.name,
          path: group.name,
          userMappings: formattedUsers,
        };
      });

      const allUserMappings = await Promise.allSettled(usersMappingPromises);

      const successfulMappings = allUserMappings
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<any>).value);

      return this.responseI18nService.fetchAll(successfulMappings, 'ROLE');
    } catch (error) {
      console.error('Error in findMapGroupToUsers:', error);
      throw this.handleError(error);
    }
  }

  async findUserAndGroup(dto: CreateUserToGroupDto): Promise<Kc_Group[] | any> {
    const userId = await this.getUserId(dto.userId);
    const groupIds = await this.getGroupId(dto.groupName);

    const url = this.config.getUserUrl('assignGroupToUser', {
      userId,
      groupId: groupIds,
    });
    const groups = await this.makeGetRequest<Kc_Group[]>(url);
    return this.responseI18nService.fetchAll(groups, 'GROUP');
  }

  async findGroupMembers(groupName: string): Promise<Kc_User[] | any> {
    const groupId = await this.getGroupId(groupName);

    const url = this.config.getGroupUrl('groupMembers', {
      groupId: groupId,
    });
    const groups = await this.makeGetRequest<Kc_User[]>(url);
    return this.responseI18nService.fetchAll(groups, 'GROUP');
  }

  async removeUsersFromGroup(
    groupName: string,
    userMappings: Kc_User[] | Kc_User,
  ): Promise<Kc_User[] | Kc_User | any> {
    try {
      const groupId = await this.getGroupId(groupName);

      const users = Array.isArray(userMappings) ? userMappings : [userMappings];

      // Find user details before proceeding
      const userDetails = await Promise.all(
        users.map((user) => this.userService.findUserById(user.id)),
      );

      for (const user of userDetails) {
        const url = this.config.getUserUrl('assignGroupToUser', {
          userId: user.userId,
          groupId,
        });

        console.log(`Removing user ${user.userId} from group ${groupId}`);

        await this.makeDeleteRequest(url, {});
      }

      return this.Kc18nService.assigned(
        'global.KEYCLOAK.USERS.UNASSIGNED',
        'GROUP',
        userDetails,
      );
    } catch (error) {
      console.error('Error removing users from group:', error);
      throw new Error(`Failed to remove users from group`);
    }
  }

  // PRIVATE FUNCTIONS

  private async getUserId(
    userId: string | string[],
  ): Promise<string | string[]> {
    if (Array.isArray(userId)) {
      const users = await Promise.all(
        userId.map((id) => this.userService.findUserById(id)),
      );
      return users.map((user) => user.userId);
    }
    const user = await this.userService.findUserById(userId);
    return user.userId;
  }

  private async getGroupId(
    groupName: string[] | string,
  ): Promise<string | string[] | any> {
    try {
      if (typeof groupName === 'string') {
        const group = await this.groupService.getGroupByName(groupName);
        if (!group.data) {
          return this.responseI18nService.notFound('GROUP');
        }
        return group.data.id;
      } else {
        const groupPromises = groupName.map(async (name) => {
          try {
            const group = await this.groupService.getGroupByName(name);
            if (!group.data) {
              return this.responseI18nService.notFound('GROUP');
            }
            return group.data.id;
          } catch (error) {
            throw error;
          }
        });

        return await Promise.all(groupPromises);
      }
    } catch (error) {
      this.logger.error(`Error fetching group ID(s): ${error.message}`);
      return this.responseI18nService.handleError(error);
    }
  }

  async fetchGroups(groupNames: string[]): Promise<Kc_Group[]> {
    const groupPromises = groupNames.map(async (groupName) => {
      const group = await this.groupService.getGroupByName(groupName);
      if (!group) {
        throw new Error(`group ${groupName} not found.`);
      }
      return group.data;
    });
    return Promise.all(groupPromises);
  }

  private async assignUserToGroup(
    dto: MapUserToGroupDto,
  ): Promise<{ payload: any; url: string }[]> {
    try {
      const userDetails = await this.getUserId(dto.userId);
      if (!userDetails) {
        throw new Error(`User with ID ${dto.userId} not found.`);
      }

      const groups = await this.fetchGroups(dto.groupNames);
      if (!groups || groups.length === 0) {
        throw new Error('No valid groups found for the provided names.');
      }

      const groupsToAdd = groups.filter((group) =>
        dto.groupNames.includes(group.name),
      );
      if (groupsToAdd.length === 0) {
        throw new Error('No matching groups found to assign.');
      }

      return await Promise.all(
        groupsToAdd.map(async (group) => {
          const url = this.config.getUserUrl('assignGroupToUser', {
            userId: userDetails,
            groupId: group.id,
          });

          console.log(
            `Assigning user ${dto.userId} to group: ${group.name} (${group.id})`,
          );
          const response = await this.makePutRequest(url, {});
          return { payload: response, url };
        }),
      );
    } catch (error) {
      console.error('Error assigning user to groups:', error);
      throw this.handleError(error);
    }
  }

  private async assignUsersToGroup(
    groupName: string,
    userMappings: Kc_User[] | Kc_User,
  ): Promise<Kc_User[] | Kc_User | any> {
    let url: string;
    try {
      const groupId = await this.getGroupId(groupName);
      if (!groupId) {
        return this.responseI18nService.notFound('GROUP');
      }

      const users = Array.isArray(userMappings) ? userMappings : [userMappings];

      const userDetails = await Promise.all(
        users.map((user) => this.userService.findUserById(user.id)),
      );

      for (const user of userDetails) {
        url = this.config.getUserUrl('assignGroupToUser', {
          userId: user.userId,
          groupId,
        });

        await this.makePutRequest(url, {});
      }

      return this.Kc18nService.assigned(
        'global.KEYCLOAK.USERS.ASSIGNED',
        'GROUP',
        userDetails,
      );
    } catch (error) {
      console.error('Error assigning users to group:', error);
      return this.handleError(error, url);
    }
  }
}
