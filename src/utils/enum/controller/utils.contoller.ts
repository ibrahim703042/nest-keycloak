import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GlobalRoles,
  StoreRoles,
  ProductRoles,
  UserRole,
  GenderType,
  UserGroup,
} from '../enumerations.enum';

@ApiTags('Enum Type')
@Controller('enum-type')
export class EnumTypeController {
  @Get('gender')
  @ApiOperation({ summary: 'Get all gender' })
  getGenderType() {
    const gender = Object.values(GenderType);
    return {
      message: 'Available global administrative roles',
      data: gender,
    };
  }

  @Get('global-roles')
  @ApiOperation({ summary: 'Get all global administrative roles' })
  getGlobalRoles() {
    const roles = Object.values(GlobalRoles);
    return {
      message: 'Available global administrative roles',
      data: roles,
    };
  }

  @Get('store-roles')
  @ApiOperation({ summary: 'Get all store-specific roles' })
  getStoreRoles() {
    const roles = Object.values(StoreRoles);
    return {
      message: 'Available store-specific roles',
      data: roles,
    };
  }

  @Get('product-roles')
  @ApiOperation({ summary: 'Get all product and inventory roles' })
  getProductRoles() {
    const roles = Object.values(ProductRoles);
    return {
      message: 'Available product and inventory roles',
      data: roles,
    };
  }

  @Get('operational-roles')
  @ApiOperation({ summary: 'Get all operational roles for restaurant' })
  getOperationalRoles() {
    const operationalRoles = Object.values(UserRole);
    return {
      message: 'Available operational roles',
      data: operationalRoles,
    };
  }

  @Get('user-group')
  @ApiOperation({ summary: 'Get all user groups for restaurant' })
  getUserRoles() {
    const operationalRoles = Object.values(UserGroup);
    return {
      message: 'Available operational roles',
      data: operationalRoles,
    };
  }
}
