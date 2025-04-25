import { OmitType } from '@nestjs/mapped-types';
import { AxiosRequestConfig } from 'axios';

export type CustomAxiosRequestConfig = AxiosRequestConfig & {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string;
  data?: any;
  headers?: any;
  retries?: number;
};

export type IAuthorizationHeaders = {
  Accept: string;
  'Content-Type': string;
  Authorization: string;
};

export type IKeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export type UserAttribute = {
  avatar?: string;
  address?: string;
  age?: number;
  phone?: string;
  gender?: string;
  store?: string[];
};

export type CreateKeycloakPayload = {
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  groups: string[];
  realmRoles?: string[];
  requiredActions?: string[];
  disableableCredentialTypes: string[];
  notBefore: number;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
  credentials?: { type: string; value: string; temporary: boolean }[];
  attributes?: UserAttribute;
};

export type KeycloakPayload = Partial<CreateKeycloakPayload>;
export type UpdateKeycloakPayload = Partial<
  Omit<KeycloakPayload, 'username' | 'credentials'>
>;
