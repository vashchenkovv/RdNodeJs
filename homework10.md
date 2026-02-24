# Новые файлы для Докера
- .dockerignore
- compose.dev.yml
- compose.yml
- Dockerfile

# Команды для создания образов
- dev

``` docker build --target dev -t my-app:dev .```

- prod

``` docker build --target prod -t my-app:prod . ```

- prod-distroless

``` docker build --target prod-distroless -t my-app:prod-distroless . ```

# Команды для Docker compose

## prod

``` docker compose -f compose.yml up --build ```

## dev

``` docker compose -f compose.yml -f compose.dev.yml up --build ```

## Миграции

``` docker compose -f compose.yml run --rm migrate ```

## Сиды

``` docker compose -f compose.yml -f compose.dev.yml run --rm seed ```