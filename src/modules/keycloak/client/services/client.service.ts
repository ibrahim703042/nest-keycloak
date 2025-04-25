import { Injectable } from '@nestjs/common';
import { KeycloakBaseService } from 'src/helpers/keycloak-config/config/keycloak-base.service';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { HttpService } from '@nestjs/axios';
import { KeycloakConfigService } from 'src/helpers/keycloak-config/config/keycloak-config.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import {
  Kc_Client,
  Kc_Session,
} from 'src/helpers/keycloak-config/types/declare';
import { ResponseData } from 'src/helpers/translate/types/i18n.types';
import { AppHelperService } from 'src/helpers/app.helper.service';

@Injectable()
export class ClientService extends KeycloakBaseService {
  constructor(
    httpService: HttpService,
    config: KeycloakConfigService,
    private readonly responseI18nService: ResponseI18nService,
    private readonly appHelperService: AppHelperService,
  ) {
    super(httpService, config, ClientService.name);
  }

  async create(createClientDto: CreateClientDto) {
    const url = this.config.getClientUrl('clients');
    try {
      const payload = createClientDto;
      const data = (await this.makePostRequest(url, payload)) as Kc_Client;
      return this.responseI18nService.create<Kc_Client>(data, 'CLIENT');
    } catch (error) {
      this.logger.error(
        `Failed to create role in Keycloak - RoleName: ${createClientDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findAll() {
    const url = this.config.getClientUrl('clients');
    try {
      const data = await this.makeGetRequest(url);
      const formattedData = this.formatClientData(data) as Kc_Client[];
      return this.responseI18nService.fetchAll(formattedData, 'CLIENT');
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, url);
    }
  }

  async findByClientId(
    clientId: string,
  ): Promise<ResponseData<Kc_Client | null>> {
    const url = this.config.getClientUrl('clients');
    try {
      const clients = await this.makeGetRequest<Kc_Client[]>(url);

      const client = clients.find((c) => c.clientId === clientId);

      if (!client) {
        this.logger.warn(`Client not found - ClientID: ${clientId}`);
        return this.responseI18nService.notFound('CLIENT');
      }

      const formattedData = this.formatClientData(client) as Kc_Client;

      return this.responseI18nService.success<Kc_Client>(
        formattedData,
        'CLIENT',
      );
    } catch (error) {
      this.logger.error(
        `Failed to find client by ClientID: ${clientId}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findSessionByClientId(
    name: string,
  ): Promise<Kc_Session[] | null | any> {
    const client = await this.findByClientId(name);
    const clientId = client?.data?.id;

    if (!clientId) {
      return this.responseI18nService.notFound('CLIENT');
    }

    const url = this.config.getClientUrl('clientSessions', {
      clientId: clientId,
    });
    try {
      const session = await this.makeGetRequest<Kc_Session[]>(url);

      if (session.length === 0) {
        this.logger.warn(`No active sessions found for ClientID: ${clientId}`);
        return null;
      }

      const formattedSession = session.map((sess) => ({
        ...sess,
        start: this.appHelperService.formatTimestamp(sess.start),
        lastAccess: this.appHelperService.formatTimestamp(sess.lastAccess),
      }));

      return this.responseI18nService.fetchAll(formattedSession, 'CLIENT');
    } catch (error) {
      this.logger.error(
        `Failed to find client by ClientID: ${clientId}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async findOne(id: string): Promise<any> {
    const url = this.config.getClientUrl('clientById', { id: id });
    try {
      const data = await this.makeGetRequest<Kc_Client>(url);
      const formattedData = this.formatClientData(data) as Kc_Client;

      return this.responseI18nService.success(formattedData, 'CLIENT');
    } catch (error) {
      this.logger.error(
        `Failed to find client in Keycloak - ClientID: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const url = this.config.getClientUrl('clients', { clientId: id });
    try {
      const payload = { name: updateClientDto.name };

      const data = await this.makePutRequest(url, payload);

      return this.responseI18nService.create(data, 'CLIENT');
    } catch (error) {
      this.logger.error(
        `Failed to create role in Keycloak - RoleName: ${updateClientDto.name}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  async remove(id: string) {
    const url = this.config.getClientUrl('clients', { clientId: id });
    try {
      const data = await this.makeDeleteRequest(url, undefined);

      return this.responseI18nService.delete(data, 'CLIENT');

      // return { message: `Group with ID ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(
        `Failed to delete group in Keycloak - GroupId: ${id}`,
        error.response?.data || error.message,
      );
      this.handleError(error, url);
    }
  }

  private formatClientData(data: any | any[]): Kc_Client | Kc_Client[] {
    if (Array.isArray(data)) {
      return data.map((client) => ({
        id: client.id,
        name: client.name,
        clientId: client.clientId,
      }));
    }

    return {
      id: data.id,
      name: data.name,
      clientId: data.clientId,
    };
  }
}
