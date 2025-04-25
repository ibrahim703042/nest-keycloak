export type UrlType =
  | 'roles'
  | 'role-users'
  | 'roleByName'
  | 'roleById'
  | 'users'
  | 'userById'
  | 'userRoles'
  | 'userGroups'
  | 'realm'
  | 'assignRoleToUser'
  | 'findRoleMappings'
  | 'assignRealmRole'
  | 'assignClientRoleToUser'
  | 'signUserToGroup';

export type UserUrl =
  | 'users'
  | 'userById'
  | 'userByMail'
  | 'userByUsername'
  | 'userRoles'
  | 'userGroups'
  | 'assignGroupToUser'
  | 'findGroupByUser'
  | 'assignRoleToUser'
  | 'userCredentials'
  | 'userSessions'
  | 'sendVerificationEmail'
  | 'resetPassword'
  | 'removeUserTotp';

export type ClientUrl =
  | 'clients'
  | 'clientById'
  | 'clientRoles'
  | 'clientUsers'
  | 'findUsersGroupByRole'
  | 'clientSessions';

export type GroupUrl =
  | 'groups'
  | 'groupById'
  | 'groupByName'
  | 'groupMembers'
  | 'groupRoleMapping'
  | 'composite'
  | 'available'
  | 'clientRoles'
  | 'clientRoleGroupAvailable';

export type VarType = {
  groupId?: string | string[];
  groupName?: string | string[];
  userId?: string | string[];
  userMail?: string;
  username?: string;
  id?: string | string[];
  clientId?: string | string[];
  clientName?: string;
  roleId?: string | string[];
  roleName?: string | string[];
  realmRoleId?: string | string[];
  realmRoleName?: string | string[];
};
