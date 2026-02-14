export enum ROLE_SCOPE {
  USERS_ALL = 'users:all',
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  ORDERS_ALL = 'orders:all',
  ORDERS_CREATE = 'orders:create',
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_DELETE = 'orders:delete',

  ORDERS_ITEM_ALL = 'orders:items:all',
  ORDERS_ITEM_CREATE = 'orders:items:create',
  ORDERS_ITEM_READ = 'orders:items:read',
  ORDERS_ITEM_UPDATE = 'orders:items:update',
  ORDERS_ITEM_DELETE = 'orders:items:delete',

  PRUDUCTS_ALL = 'products:all',
  PRUDUCTS_CREATE = 'products:create',
  PRUDUCTS_READ = 'products:read',
  PRUDUCTS_UPDATE = 'products:update',
  PRUDUCTS_DELETE = 'products:delete',
}
