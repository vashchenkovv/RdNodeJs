import 'dotenv/config';
import { AppDataSource as dataSource } from './../../data-source';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { In } from 'typeorm';
import { Order } from 'src/orders/order.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { Role } from 'src/users/roles.entity';
import { ROLE_SCOPE } from 'src/auth/enums/role-scope.enum';
import { ROLES } from 'src/auth/enums/roles.enum';
import * as bcrypt from 'bcryptjs';

const roleSeed: Role[] = [
  {
    role: ROLES.ADMIN,
    scopes: [
      ROLE_SCOPE.ORDERS_ALL,
      ROLE_SCOPE.ORDERS_ITEM_ALL,
      ROLE_SCOPE.PRUDUCTS_ALL,
      ROLE_SCOPE.USERS_ALL,
      ROLE_SCOPE.FILE_ALL,
    ],
    isDefCustomerRole: false,
  },
  {
    role: ROLES.SUPPORT,
    scopes: [
      ROLE_SCOPE.USERS_READ,
      ROLE_SCOPE.ORDERS_READ,
      ROLE_SCOPE.ORDERS_DELETE,
      ROLE_SCOPE.ORDERS_UPDATE,
      ROLE_SCOPE.FILE_READ,
    ],
    isDefCustomerRole: false,
  },
  {
    role: ROLES.ACCOUNTER,
    scopes: [
      ROLE_SCOPE.ORDERS_READ,
      ROLE_SCOPE.PRUDUCTS_READ,
      ROLE_SCOPE.FILE_READ,
    ],
    isDefCustomerRole: false,
  },
  {
    role: ROLES.MANAGER,
    scopes: [ROLE_SCOPE.PRUDUCTS_ALL, ROLE_SCOPE.FILE_ALL],
    isDefCustomerRole: false,
  },
  {
    role: ROLES.CUSTOMER,
    scopes: [
      ROLE_SCOPE.USERS_READ,
      ROLE_SCOPE.PRUDUCTS_READ,
      ROLE_SCOPE.ORDERS_READ,
      ROLE_SCOPE.ORDERS_CREATE,
      ROLE_SCOPE.ORDERS_ITEM_READ,
      ROLE_SCOPE.ORDERS_ITEM_CREATE,
      ROLE_SCOPE.FILE_UPLOAD,
      ROLE_SCOPE.FILE_READ,
    ],
    isDefCustomerRole: true,
  },
];

class UserSeed extends User {
  password: string;
}

const userTpl: Partial<UserSeed>[] = [
  {
    name: 'James Smith',
    email: 'j.smith@example.com',
    roles: [ROLES.ADMIN],
    password: 'password',
  },
  {
    name: 'Emma Johnson',
    email: 'emma.johnson@gmail.com',
    roles: [ROLES.SUPPORT],
    password: 'password',
  },
  {
    name: 'Michael Williams',
    email: 'm.williams@outlook.com',
    roles: [ROLES.ACCOUNTER],
    password: 'password',
  },
  {
    name: 'Sophia Brown',
    email: 's.brown@icloud.com',
    roles: [ROLES.MANAGER],
    password: 'password',
  },
  {
    name: 'William Jones',
    email: 'william.jones@mail.com',
    roles: [ROLES.CUSTOMER],
    password: 'password',
  },
];

const productSeed: Partial<Product>[] = [
  { title: 'Wireless Headphones', price: 199.99, stock: 100 },
  { title: 'Smartphone Pro Max', price: 1099.0, stock: 100 },
  { title: 'Mechanical Keyboard', price: 85.5, stock: 100 },
  { title: 'Gaming Mouse', price: 45.0, stock: 100 },
  { title: 'UltraWide Monitor', price: 349.99, stock: 100 },
  { title: 'Laptop Stand', price: 29.9, stock: 100 },
  { title: 'Smart Watch Series 7', price: 399.0, stock: 100 },
  { title: 'Portable SSD 1TB', price: 120.0, stock: 100 },
  { title: 'USB-C Hub Adapter', price: 35.0, stock: 100 },
  { title: 'Bluetooth Speaker', price: 59.95, stock: 100 },
  { title: 'Electric Coffee Maker', price: 89.0, stock: 100 },
  { title: 'Air Fryer XL', price: 149.99, stock: 100 },
  { title: 'Yoga Mat', price: 25.0, stock: 0 },
  { title: 'Dumbbell Set (10kg)', price: 40.0, stock: 100 },
  { title: 'Running Shoes', price: 115.0, stock: 100 },
  { title: 'Backpack for Laptop', price: 65.0, stock: 100 },
  { title: 'Insulated Water Bottle', price: 18.5, stock: 100 },
  { title: 'Desk LED Lamp', price: 32.0, stock: 10 },
  { title: 'Wireless Charger Pad', price: 24.99, stock: 10 },
  {
    title: 'Noise Cancelling Earbuds',
    price: 129.0,
    stock: 0,
    isActive: false,
  },
];

const orderTpls = [
  {
    id: '4f9e1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
    userEmail: 'j.smith@example.com',
    items: [
      {
        id: 'a1b2c3d4-e5f6-4789-a1b2-c3d4e5f67890',
        productTitle: 'Wireless Headphones',
        quantity: 1,
      },
      {
        id: 'd5e6f7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8a',
        productTitle: 'Smartphone Pro Max',
        quantity: 1,
      },
    ],
  },
  {
    id: '7d8c9b0a-1f2e-4d3c-9b8a-7e6f5d4c3b2a',
    userEmail: 'emma.johnson@gmail.com',
    items: [
      {
        id: 'b2c3d4e5-f6a7-48b9-9c0d-1e2f3a4b5c6d',
        productTitle: 'Mechanical Keyboard',
        quantity: 1,
      },
      {
        id: 'f1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6',
        productTitle: 'Gaming Mouse',
        quantity: 1,
      },
    ],
  },
];

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is disabled in production');
  }

  await dataSource.initialize();

  const roleRepository = dataSource.getRepository(Role);
  const usersRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);
  const orderRepository = dataSource.getRepository(Order);
  const orderItemRepository = dataSource.getRepository(OrderItem);

  const userSeed: Partial<User>[] = userTpl.map((tpl) => ({
    name: tpl.name,
    email: tpl.email,
    roles: tpl.roles,
    passwordHash: tpl.password ? bcrypt.hashSync(tpl.password, 10) : null,
  }));

  await roleRepository.upsert(roleSeed, ['role']);
  await usersRepository.upsert(userSeed, ['email']);
  await productRepository.upsert(productSeed, ['title']);

  const users: User[] = await usersRepository.find({
    where: { email: In(userSeed.map((user) => user.email)) },
  });
  const products: Product[] = await productRepository.find({
    where: { title: In(productSeed.map((product) => product.title)) },
  });

  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  const productsByTitle = new Map(
    products.map((product) => [product.title, product]),
  );

  const orderSeeds: Partial<Order>[] = [];
  for (const orderTpl of orderTpls) {
    const user = usersByEmail.get(orderTpl.userEmail);
    if (!user) continue;
    orderSeeds.push({
      user,
      id: orderTpl.id,
    });
  }

  if (orderSeeds.length) {
    await orderRepository.upsert(orderSeeds, ['id']);
  }
  const orders: Order[] = await orderRepository.find({
    where: { id: In(orderSeeds.map((os) => os.id)) },
  });
  const ordersById = new Map(orders.map((order) => [order.id, order]));

  const orderItemSeeds: Partial<OrderItem>[] = [];
  orderTpls.forEach((orderTpl) => {
    orderTpl.items.forEach((item) => {
      const order = ordersById.get(orderTpl.id);
      const product = productsByTitle.get(item.productTitle);
      if (!order || !product) return;
      orderItemSeeds.push({
        order,
        product,
        quantity: item.quantity,
        priceSnapshot: product.price?.toString() ?? '0.00',
      });
    });
  });

  if (orderItemSeeds.length) {
    await orderItemRepository.upsert(orderItemSeeds, ['id']);
  }
}

seed();
