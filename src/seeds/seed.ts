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
    id: '921477fc-9ee9-4e5d-8f9b-e15ac15d760c',
    name: 'James Smith',
    email: 'j.smith@example.com',
    roles: [ROLES.ADMIN],
    password: 'password',
  },
  {
    id: '688d0e00-4aa5-499d-8cd6-e6f1d8767916',
    name: 'Emma Johnson',
    email: 'emma.johnson@gmail.com',
    roles: [ROLES.SUPPORT],
    password: 'password',
  },
  {
    id: '1f3bbd5b-4044-41c1-8fde-d5a22e4dc532',
    name: 'Michael Williams',
    email: 'm.williams@outlook.com',
    roles: [ROLES.ACCOUNTER],
    password: 'password',
  },
  {
    id: '683153da-464c-415f-af1e-c11a895ac952',
    name: 'Sophia Brown',
    email: 's.brown@icloud.com',
    roles: [ROLES.MANAGER],
    password: 'password',
  },
  {
    id: 'ce350623-0ca4-4cf8-9618-ef2b4b7f1ffb',
    name: 'William Jones',
    email: 'william.jones@mail.com',
    roles: [ROLES.CUSTOMER],
    password: 'password',
  },
];

const productSeed: Partial<Product>[] = [
  {
    id: '56cc60ca-8c52-4f2c-be99-70966f607438',
    title: 'Wireless Headphones',
    price: 199.99,
    stock: 100,
  },
  {
    id: '7d7bfcb9-d965-4af0-9cc1-e06d2d0fc4df',
    title: 'Smartphone Pro Max',
    price: 1099.0,
    stock: 100,
  },
  {
    id: 'dc48db23-bd7d-4d5c-a7a9-49d7dd755273',
    title: 'Mechanical Keyboard',
    price: 85.5,
    stock: 100,
  },
  {
    id: 'f46f2191-92cf-4f92-8f2a-c47487c3f6e8',
    title: 'Gaming Mouse',
    price: 45.0,
    stock: 100,
  },
  {
    id: '428a1e71-0563-4c1c-bf76-10e3c07b6938',
    title: 'UltraWide Monitor',
    price: 349.99,
    stock: 100,
  },
  {
    id: '8121062f-99b1-456d-9322-5dafff73fa52',
    title: 'Laptop Stand',
    price: 29.9,
    stock: 100,
  },
  {
    id: 'ebdf18e7-11af-41fb-837c-0b870ec3574d',
    title: 'Smart Watch Series 7',
    price: 399.0,
    stock: 100,
  },
  {
    id: 'cec0a3b6-2c3b-4cfc-ba27-cf97aa0ca7ca',
    title: 'Portable SSD 1TB',
    price: 120.0,
    stock: 100,
  },
  {
    id: '420f4555-0582-4c51-ab8f-42e9c281f40d',
    title: 'USB-C Hub Adapter',
    price: 35.0,
    stock: 100,
  },
  {
    id: '58cf4c65-5a63-41db-99e1-e4ff0e532ed7',
    title: 'Bluetooth Speaker',
    price: 59.95,
    stock: 100,
  },
  {
    id: '305464f3-fbf4-4172-baa1-efeb4c99116a',
    title: 'Electric Coffee Maker',
    price: 89.0,
    stock: 100,
  },
  {
    id: '8bd3ee1a-78fa-4074-90b9-e61d76dc0aca',
    title: 'Air Fryer XL',
    price: 149.99,
    stock: 100,
  },
  {
    id: '393b472c-8378-4a43-b8f5-fa6e9432d2ec',
    title: 'Yoga Mat',
    price: 25.0,
    stock: 0,
  },
  {
    id: 'ece66abf-289c-4634-87a2-186a407d222a',
    title: 'Dumbbell Set (10kg)',
    price: 40.0,
    stock: 100,
  },
  {
    id: 'a952a983-28cd-4970-8a6a-630a43470de2',
    title: 'Running Shoes',
    price: 115.0,
    stock: 100,
  },
  {
    id: '82d2a4b1-112b-4ea3-925a-a9e15d2a8fb9',
    title: 'Backpack for Laptop',
    price: 65.0,
    stock: 100,
  },
  {
    id: '20058c98-89bf-4286-b625-11cbe530e355',
    title: 'Insulated Water Bottle',
    price: 18.5,
    stock: 100,
  },
  {
    id: '0794878b-ac84-4cd1-931f-715b548de0ec',
    title: 'Desk LED Lamp',
    price: 32.0,
    stock: 10,
  },
  {
    id: '03ed6552-ecf0-427a-88f1-d83f01c6d61e',
    title: 'Wireless Charger Pad',
    price: 24.99,
    stock: 10,
  },
  {
    id: '76e5f170-1a80-486b-a68f-1b1656d7d436',
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
  await dataSource.initialize();

  const roleRepository = dataSource.getRepository(Role);
  const usersRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);
  const orderRepository = dataSource.getRepository(Order);
  const orderItemRepository = dataSource.getRepository(OrderItem);

  const userSeed: Partial<User>[] = userTpl.map((tpl) => ({
    id: tpl.id,
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
