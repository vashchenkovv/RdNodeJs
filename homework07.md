# GraphQL

## схема

Для создания схем был используем метод code-first. Этот метод был выбран что бы оставаться в одном код стиле, так как мы работаем c TS. Так же этот метод хорошо подходит если у нас уже есть какие-то сущности и декораторы для GraphQL можно использовать вместе с этими сущностями что бы описать схемы. 

## DataLoader 

Для пакетной загрузки данных используется библиотека dataloader. Реализация загрузчиков находится в LoadersFactory который инициализирует список этих загрузчиков в модуле AppGraphQlModule. Кол-во запросов выводится в консоле.

Оптимизированный запрос (использует загрузчики)

```
query Orders {
    orders {
        id
        userId
        status
        createdAt
        updatedAt
        user {
            id
            name
            email
        }
        items {
            id
            productId
            quantity
            price
            total
            product {
                id
                title
                price
            }
        }
    }
}
```
результат: 4 запроса 

Ну оптимизированный запрос (не использует загрузчики)

```
query OrdersNaive {
    ordersNaive {
        id
        userId
        status
        createdAt
        updatedAt
        user {
            id
            name
            email
        }
        items {
            id
            productId
            quantity
            price
            total
            product {
                id
                title
                price
            }
        }
    }
}
```

результат: 9 запросов

