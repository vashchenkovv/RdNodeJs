## Setup

Copy `.env.example` to `.env`


```
docker compose -f docker-compose.yml up -d
npm i
npm run migration:run
npm run seed
npm run start:dev
```

## Login

POST http://localhost:3000/auth/login

Payload:

```
{
    "email": "j.smith@example.com",
    "password": "password"
}
```

Полученный accessToken добавляем в заголовок ко всем следующим запросам 

Authorization: Bearer {accessToken}

## Happy path

Создать ордел и отследить выполнение в консоли 

POST http://localhost:3000/orders

payload

```
{
    "userEmail": "j.smith@example.com",
    "items": [
        {
            "productId": "56cc60ca-8c52-4f2c-be99-70966f607438",
            "quantity": 1,
            "price": 150.00
        }
    ],
    "idempotencyKey": "123"
}
```

## Retry & DLQ

Создать ордер и отследить выполнение в консоли. Используем тестовый роут для эмуляции ошибки

POST http://localhost:3000/tests/rebbitmq/orders/emulate-issue?issue=poison

payload

```
{
    "userEmail": "j.smith@example.com",
    "items": [
        {
            "productId": "56cc60ca-8c52-4f2c-be99-70966f607438",
            "quantity": 1,
            "price": 150.00
        }
    ],
    "idempotencyKey": "1234"
}
```

## Idempotency

Создать ордер и отследить выполнение в консоли. Используем тестовый роут для эмуляции ошибки

POST http://localhost:3000/tests/rebbitmq/orders/emulate-issue?issue=idempotency

payload

```
{
    "userEmail": "j.smith@example.com",
    "items": [
        {
            "productId": "56cc60ca-8c52-4f2c-be99-70966f607438",
            "quantity": 1,
            "price": 150.00
        }
    ],
    "idempotencyKey": "12345"
}
```

API что бы посмотреть статус ордера

http://localhost:3000/orders/{:orderId}

