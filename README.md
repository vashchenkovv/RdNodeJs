## Setup
1) Copy `.env.example` to `.env` and adjust values.
2) Start database:
```
docker compose -f docker-compose.yml  up -d
```
3) Install dependencies:
```
npm i
```
4) Run migrations:
```
npm run migration:run
```
5) Seed data:
```
npm run seed
```
6) Start API:
```
npm run start:dev
```

## Key endpoints
- `POST /orders` creates an order in a single transaction
- `GET /orders` lists orders with filters

- `GET /users` get list of users
- `GET /users/:id` get one user by ID
- `POST /users` create new user
- `PATCH /users/:id` update user
- `DELETE /users/:id` remove user
- `PATHC /users/avatar` Set user avatar

- `POST /auth/login` login
- `POST /auth/register` register new customer

- `POST /files/presign` presign file
- `POST /files/complete` file uploaded
- `GET /files/:id` get file meta data

- `PATHC /pruduct/image` Set product image

## GraphQL
- `/graphql`