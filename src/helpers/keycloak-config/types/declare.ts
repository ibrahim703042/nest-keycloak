export type DecodedUserInfo = {
  userId: string;
  name: string;
  email: string;
  username: string;
  givenName?: string;
  familyName?: string;
  roles: string[];
};

export type Kc_User = {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  avatar?: string;
  enabled?: boolean;
};

export type Kc_Role = {
  id?: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
};

export type Kc_Client = {
  id?: string;
  clientId: string;
  name: string;
  description?: string;
  enabled?: boolean;
};

export type Kc_Group = {
  id?: string;
  name: string;
  path?: string;
  subGroups?: Kc_Group[];
};

export type Kc_AssignClientRoleToGroupDto = {
  clientId: string;
  groupName: string;
  roleNames: string[];
};

export type Kc_Session = {
  id: string;
  username: string;
  clientId: string;
  ipAddress: string;
  start: number;
  lastAccess: number;
  rememberMe?: boolean;
};
