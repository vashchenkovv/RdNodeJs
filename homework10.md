# Новые файлы для Докера
- .dockerignore
- compose.dev.yml
- compose.yml
- Dockerfile

# Команды для создания образов
- dev

``` docker build --target dev -t api:dev .```

- prod

``` docker build --target prod -t api:prod . ```

- prod-distroless

``` docker build --target prod-distroless -t api:prod-distroless . ```

## Доказательство оптимизация

``` docker image ls ```

    IMAGE                 ID             DISK USAGE   CONTENT SIZE   EXTRA
    api:dev               7857f5e164d8        776MB          151MB
    api:prod              3a52b7675090        452MB         82.3MB
    api:prod-distroless   fd2691632861        383MB         67.1MB

Видно что prod-distroless занимает меньше всего места

# Команды для Docker compose

## prod-like

``` docker compose -f compose.yml up --build ```

## dev

``` docker compose -f compose.yml -f compose.dev.yml up --build ```

## migrate

``` docker compose -f compose.yml run --rm migrate ```

## seed

``` docker compose -f compose.yml run --rm seed ```