import { I18nTranslations } from '../generated/i18n.generated';

// Define global keys for internationalization
export type GlobalKey = keyof I18nTranslations['global'];

// Define validation-related keys
type ValidationKey = keyof I18nTranslations['global']['VALIDATION'];
type ErrorKey = keyof I18nTranslations['global']['ERRORS']['VALIDATION_ERROR'];

// Define entity and field keys for collections
export type EntityKey = keyof I18nTranslations['collection']['ENTITY'];
export type FieldKey = keyof I18nTranslations['collection']['FIELD'];

// Define a type for the keys of the 'otherMessage' translations
type OtherMessageKey = keyof I18nTranslations['otherMessage'];
type NestedOtherKey = `${keyof I18nTranslations['otherMessage']}.${string}`;
export type OtherKeyUnion = OtherMessageKey | NestedOtherKey;

// Define a structure for parameters used in validation errors
export type ValidationErrorDetails = {
  key: OtherKeyUnion;
  fieldName?: FieldKey;
};

// Structure for validation error parameters
export type ValidationErrorParams = {
  key: ValidationKey;
  fieldName: FieldKey;
};

// Structure for general error parameters
export type ErrorParams = {
  key: ErrorKey;
  fieldName: FieldKey;
};

export class ResponseData<T> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: Error[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  data: T[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  data: T[];
  metadata?: Record<string, any>;
}
