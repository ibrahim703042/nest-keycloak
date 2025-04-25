import { Injectable, NotFoundException } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Kc_Group } from 'src/helpers/keycloak-config/types/declare';
import { ResponseData } from 'src/helpers/response-helpers/utils';
import { ApiResponse } from 'src/helpers/translate/types/i18n.types';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';

@Injectable()
export class GroupService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
  ) {
    super(httpService, config, GroupService.name);
  }

  async create(createGroupDto: CreateGroupDto) {
    const url = this.config.getGroupUrl('groups');
    try {
      const payload = { name: createGroupDto.name };
      const createResponse = await this.makePostRequest(url, payload);

      const groupDetails = await this.getByName(createGroupDto.name);

      return this.responseI18nService.create(groupDetails, 'GROUP');
    } catch (error) {
      this.logger.error(
        `Failed to create group in Keycloak - groupName: ${createGroupDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findWithPage(
    pageOptionsDto?: PageOptionsDto,
  ): Promise<ApiResponse<Kc_Group>> {
    const { take, skip, order = 'asc', search } = pageOptionsDto; // Default to 'asc' order
    const url = this.config.getGroupUrl('groups');

    try {
      const response = (await this.makeGetRequest(url)) as Kc_Group[];
      console.log('Response:', response);

      // Apply search filter
      let filteredGroups = response;
      if (search) {
        filteredGroups = response.filter((group) =>
          group.name.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const sortedGroups = filteredGroups.sort((a, b) => {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });

      return this.responseI18nService.fetchAll(sortedGroups, 'GROUP');
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, url);
    }
  }

  async findAll(): Promise<ApiResponse<Kc_Group>> {
    const url = this.config.getGroupUrl('groups');

    try {
      const response = (await this.makeGetRequest(url)) as Kc_Group[];
      return this.responseI18nService.fetchAll(response, 'GROUP');
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, url);
    }
  }

  async findMembers(id: string) {
    const url = this.config.getGroupUrl('groupMembers', { groupId: id });
    try {
      const data = await this.makeGetRequest(url);

      return this.responseI18nService.success(data, 'GROUP');
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, url);
    }
  }

  async getGroupByName(groupName: string): Promise<ResponseData<Kc_Group>> {
    const url = this.config.getGroupUrl('groupByName', { groupName });

    try {
      const response: Kc_Group[] = (await this.makeGetRequest(
        url,
      )) as Kc_Group[];

      if (!response || response.length === 0) {
        return this.responseI18nService.notFound('GROUP');
      }

      const res = response[0];
      return this.responseI18nService.success(res, 'GROUP');
    } catch (error) {
      this.logger.error(
        `Failed to retrieve group details - groupName: ${groupName}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findOne(id: string) {
    const url = this.config.getGroupUrl('groupById', { groupId: id });
    try {
      const data = await this.makeGetRequest(url);
      console.log('Data :', data);

      return this.responseI18nService.create(data, 'GROUP');
    } catch (error) {
      this.logger.error(
        `Failed to find group in Keycloak - GroupID: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    const url = this.config.getGroupUrl('groupById', { groupId: id });
    try {
      const payload = { name: updateGroupDto.name };

      const data = await this.makePutRequest(url, payload);
      const groupDetails = await this.getByName(updateGroupDto.name);

      return this.responseI18nService.update(groupDetails, 'GROUP');
    } catch (error) {
      this.logger.error(
        `Failed to create group in Keycloak - groupName: ${updateGroupDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async remove(id: string) {
    const url = this.config.getGroupUrl('groupById', { groupId: id });
    try {
      const data = await this.makeDeleteRequest(url, undefined);

      return this.responseI18nService.delete(data, 'GROUP');

      // return { message: `Group with ID ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(
        `Failed to delete group in Keycloak - GroupId: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  private async getByName(groupName: string) {
    const url = this.config.getGroupUrl('groupByName', {
      groupName: groupName,
    });
    const response = await this.makeGetRequest(url);
    return response?.[0] || null;
  }
}
