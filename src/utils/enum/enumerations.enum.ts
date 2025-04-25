export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum StatusType {
  ACTIVE = 'active',
  CLOSED = 'closed',
  CURRENT_YEAR = 'current year',
  UPCOMING_YEAR = 'upcoming year',
}

export enum GlobalRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESTO_ADMIN = 'RESTO_ADMIN',
}

// Store-Specific Roles
export enum StoreRoles {
  STORE_OWNER = 'STORE_OWNER',
  STORE_ADMIN = 'STORE_ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  STORE_STAFF = 'STORE_STAFF',
}

// Product and Inventory Roles
export enum ProductRoles {
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

// Sales and Orders Roles
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  WAITER = 'waiter',
  CHEF = 'chef',
  STOCK_MANAGER = 'stock-manager',
  CUSTOMER = 'customer',
}

export enum UserGroup {
  ADMIN = 'admin',
  WAITER = 'waiter',
  STAFF = 'staff',
  DELIVERY_PERSON = 'delevery person',
}
