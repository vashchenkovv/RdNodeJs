## як реалізована транзакція

Для реализации транзакции был выбран метод создания queryRunner, этот способ дает полный контроль над выполнение транзакции. Сначала мы выполняем подключение к БП и запускаем транзакцию. Затем в области try мы выполняем все необходимые изменения в БП и в конце применяем все эти изменения. В случаи ошибки мы попадем в блок catch где сможем отменить изменения с помощью queryRunner, выполнив команду rollbackTransaction. В блоке finally для завершения транзакции. 

[Orders Service](https://github.com/vashchenkovv/RdNodeJs/blob/master/src/orders/orders.service.ts)

## який механізм конкурентності обрано

Для списания остатков товаров был выбран метод «pessimistic_write» В этом случае другие запросы будут ожидать когда доступ к записям в таблице будет разрешеню.

[Orders Service](https://github.com/vashchenkovv/RdNodeJs/blob/master/src/orders/orders.service.ts)

## як працює ідемпотентність

Добавили свойство "idempotencyKey" в тело запроса. Если ордер с подобным idempotencyKey существуе в БД мы веренм этот ордер

[CreateOrderItemDto](https://github.com/vashchenkovv/RdNodeJs/blob/master/src/orders/dto/create-order.dto.ts)

[Order Entity](https://github.com/vashchenkovv/RdNodeJs/blob/master/src/orders/order.entity.ts)

[Orders Service](https://github.com/vashchenkovv/RdNodeJs/blob/master/src/orders/orders.service.ts)

## ~~який запит оптимізували та які індекси додали~~