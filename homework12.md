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

После успешного создания ордера, ордер сервис создает сообщение и помещает его в очередь orders.process. Значение messageId генерируется случайно в момент создания сообщения, что избежать повторного выполнения одно и того же сообщения в будущем.

Тип сообщения:

```
type OrdersProcessMessage = {
  messageId: string; - идентификатора сообщения
  orderId: string; - идентификатора ордера
  createdAt: string; - дата создания
  attempt: number; - количество попыток (в случае ошибки кол-во увеличивается на 1)
  producer: string | null; - идентификатора пользователя который создал сообщение
  eventName: string | null; - имя события (произвольное значение)
  testIssue?: string | null; - необходимо для тестировал исключений (только для тестов)
};
```

В роли воркера выступает сервис OrdersWorkerService который запускается при старте приложения. 

Воркер получает сообщение. Если ему не удается распарсить сообщение, тогда выдаем ошибку, останавливаем процесс обработки сообщения. 

Передаем полученное сообщение в ordersService для обрабоки. Если ordersService выбрасывает ошибку, увеличиваем число попыток на 1 и возвращаем сообщение в очередь. После трех попыток, сообщение попадает в очередь orders.dlq.

В ordersService пытается создать запись в таблицу базы данных (processed_messages)

Поля сущности ProcessedMessage

```
class ProcessedMessage {
    id: string; - идентификатора сущности
    messageId: string; - идентификатора сообщения
    orderId: string; - идентификатора ордера
    eventName?: string | null; - имя события
    processedAt: Date; - дата обработки ордера
    createdAt: Date; - дата создания сущности
}
```

ProcessedMessage имеет уникальное поле messageId и если нам ну удается создать сущность с определенным messageId, то мы уже обработали это сообщения и пытаемся обработать его еще раз. В это случае прекращаем обработку сообщения.

Обновляем статус ордера, оповещаем пользователя об изменения статуса, заканчиваем обработку соообщения.


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

Количество повторов: 3
После трех неудачных попыток задача помещается в очередь orders.dlq

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

