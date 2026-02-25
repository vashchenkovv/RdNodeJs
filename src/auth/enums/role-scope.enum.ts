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

  FILE_ALL = 'file:all',
  FILE_UPLOAD = 'file:upload',
  FILE_READ = 'file:read',
  FILE_DELETE = 'file:delete',

  PAYMENT_ALL = 'payment:all',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ = 'payment:read',
  PAYMENT_UPDATE = 'payment:update',
  PAYMENT_DELETE = 'payment:delete',
}
