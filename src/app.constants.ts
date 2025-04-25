export const SwaggerConstants = {
  title: 'User Management',
  customTitle: 'User Management',
  termsOfService:
    'User management based on Keycloak involves secure integration of authentication, authorization, and role management.',
  description:
    'This user management module is powered by Keycloak to provide centralized and secure authentication, while leveraging gRPC for fast and efficient inter-service communication. It enables creating, updating, deleting, and managing user roles and profiles within a microservices architecture.',
  logger: 'User management via Keycloak is running on gRPC',
};

export const ApiConstants = {
  crud: (entityName: string, any?: string) => {
    return {
      create: {
        summary: `Create a new ${entityName}`,
        bodyDescription: `Provide ${entityName} details to create a new ${entityName} record.`,
        // bodyDescription: `Name of the ${entityName}. Allowed values are: ${Object.values(UserRole).join(', ')}.`,
        response201: `The ${entityName} has been successfully created.`,
        response400: `Invalid data provided for creating a ${entityName}.`,
      },
      findAll: {
        summary: `Retrieve all ${entityName}s with pagination`,
        summary_withoutPagination: `Retrieve all ${entityName}(s) without pagination`,
        summary_withOtherEntity: `Retrieve all ${entityName} details for a specific ${any}.`,
        summary_any: `${any}.`,
        response200: `List of ${entityName}s retrieved successfully.`,
        response400: `Invalid pagination parameters provided.`,
      },
      findOne: {
        summary: `Retrieve a specific ${entityName} by its ID`,
        response200: `The ${entityName} details were retrieved successfully.`,
        response404: `The ${entityName} with the given ID was not found.`,
      },
      update: {
        summary: `Update a specific ${entityName} by its ID`,
        bodyDescription: `Provide updated details for the ${entityName}.`,
        response200: `The ${entityName} has been successfully updated.`,
        response400: `Invalid data provided for updating the ${entityName}.`,
        response404: `The ${entityName} with the given ID was not found.`,
      },
      remove: {
        summary: `Delete a specific ${entityName} by its ID`,
        response204: `The ${entityName} has been successfully deleted.`,
        response404: `The ${entityName} with the given ID was not found.`,
      },
      bulkCreate: {
        summary: `Create multiple ${entityName}s in a single request.`,
        description: `Provide an array of ${entityName} objects to create them in bulk.`,
        response201: `The ${entityName}s have been successfully created.`,
        response400: `Invalid data provided for creating multiple ${entityName}s.`,
      },
      bulkDelete: {
        summary: `Delete multiple ${entityName}s by their IDs`,
        description: `Provide an array of IDs to delete multiple records.`,
        response204: `The specified ${entityName}s were successfully deleted.`,
      },
      softDelete: {
        summary: `Mark a specific ${entityName} as inactive instead of permanently deleting it.`,
        response204: `The ${entityName} was successfully marked as inactive.`,
      },
      summary: `${any}`,
      description: `${any}`,
    };
  },
};

export const KcApiConstants = {
  auth: {
    login: {
      summary: `Authenticate a user and generate an access token`,
      description: `Provide valid credentials to receive an access token.`,
      response200: `User authenticated successfully.`,
      response401: `Invalid credentials provided.`,
    },
    logout: {
      summary: `Log out a user and invalidate the session`,
      description: `Invalidate the user's session and access token.`,
      response204: `User logged out successfully.`,
    },
    refreshToken: {
      summary: `Refresh the access token`,
      description: `Use a refresh token to obtain a new access token.`,
      response200: `New access token issued successfully.`,
      response401: `Invalid or expired refresh token.`,
    },
  },

  crud: (entity: string, member?: string) => ({
    create: {
      summary: `Create a new ${entity} in keycloak`,
      description: `Provide ${entity} details to create a new ${entity}.`,
      response201: `Realm created successfully.`,
      response400: `Invalid data provided for creating a ${entity} in keycloak.`,
    },
    list: {
      summaryPagination: `Retrieve all ${entity}(s) in keycloak with pagination`,
      summaryNoPagination: `Retrieve all ${entity}(s) in keycloak without pagination`,
      listOfMembers: `Retrieve all ${member}(s) in keycloak ${entity}(s)`,
      response200: `List of registered ${entity} retrieved successfully.`,
      response400: `Invalid pagination parameters provided.`,
    },
    findOne: {
      summary: `Retrieve a specific ${entity} by ID in keycloak`,
      response200: `${entity} retrieved successfully.`,
      response404: `${entity} not found.`,
    },
    findByname: {
      summary: `Retrieve a specific ${entity} by name in keycloak`,
      response200: `${entity} retrieved successfully.`,
      response404: `${entity} not found.`,
    },
    update: {
      summary: `Update a specific ${entity} by ID in keycloak.`,
      description: `Provide updated details for the ${entity}.`,
      response200: `${entity} updated successfully.`,
      response404: `${entity} not found.`,
      response400: `Invalid data provided for updating a ${entity} in keycloak.`,
    },
    remove: {
      summary: `Delete a specific ${entity} in keycloak`,
      response204: `${entity} deleted successfully.`,
      response404: `${entity} not found.`,
    },
  }),

  dataMapped: (entity_1: string, entity_2: string) => ({
    assign: {
      summary: `Assign a ${entity_1} to ${entity_2}(s)`,
      summaryMultiple: `Assign multiple ${entity_1}(s) to ${entity_2}`,
      description: `Provide ${entity_2} ID and ${entity_1} ID to assign.`,
      response200: `${entity_1} assigned successfully.`,
      response400: `Invalid ${entity_1} or ${entity_2} ID.`,
    },
    remove: {
      summary: `Unassign a ${entity_1} from a ${entity_2}`,
      description: `Provide ${entity_2} ID and role ID to revoke.`,
      response204: `Unassign ${entity_1}(s) in ${entity_2} successfully.`,
      response400: `Invalid ${entity_1} or ${entity_2} ID.`,
    },
    findOne: {
      summary: `Retrieve a specific assigned ${entity_1} by ${entity_2} ID in keycloak`,
      response200: `${entity_1} retrieved successfully.`,
      response404: `${entity_1} not found.`,
    },
    list: {
      summary: `Retrieve all ${entity_1} available in ${entity_2}.`,
      summaryAssign: `Retrieve all assign ${entity_1}(s) available in ${entity_2}.`,
      response200: `List of ${entity_1} retrieved successfully.`,
      response204: `No data found for ${entity_1}(s) in ${entity_2}.`,
      response400: `Invalid ${entity_1} or ${entity_2} ID.`,
    },
  }),

  permissions: {
    assignPermission: {
      summary: `Grant a specific permission to a role`,
      description: `Provide role ID and permission details to assign a permission.`,
      response200: `Permission assigned successfully.`,
    },
    revokePermission: {
      summary: `Revoke a specific permission from a role`,
      description: `Provide role ID and permission details to remove a permission.`,
      response200: `Permission revoked successfully.`,
    },
    listPermissions: {
      summary: `Retrieve all permissions assigned to a role`,
      response200: `List of permissions retrieved successfully.`,
    },
  },

  users: {
    deactivateUser: {
      summary: `Deactivate a user account instead of deleting it`,
      description: `Mark a user as inactive so they cannot log in.`,
      response204: `User account deactivated successfully.`,
    },
    activateUser: {
      summary: `Reactivate a previously deactivated user`,
      response200: `User account reactivated successfully.`,
    },
    resetPassword: {
      summary: `Reset a user's password`,
      description: `Send a password reset link or update the password directly.`,
      response200: `Password reset successfully.`,
      response400: `Invalid password reset request.`,
    },
  },
};
