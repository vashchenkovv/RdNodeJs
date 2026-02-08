## Setup
1) Copy `.env.example` to `.env` and adjust values.
2) Start database:
```
docker compose up -d
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
- `POST api/orders` creates an order in a single transaction
- `GET api/orders` lists orders with filters

- `GET api/users` get list of users
- `GET api/users/id` get one user by ID
- `POST api/users` create new user
- `PATCH api/users/id` update user
- `DELETE api/users/id` remove user