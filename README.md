# Marina AI Style

Веб-приложение для подбора одежды из личного гардероба с учётом погоды, цветов, стиля и ИИ-рекомендаций.

## Стек

- **Фронт**: Чистый JS + HTML/CSS
- **Бэк**: ASP.NET 10 + PostgreSQL
- **AI**: OpenRouter API

## Запуск

### PostgreSQL

```bash
psql -U postgres -c "CREATE DATABASE marina_ai_style;"
psql -U postgres -d marina_ai_style -f marina_ai_style.sql
```

### Бэкенд

```bash
cd backend
dotnet restore
dotnet run
```

### Фронт

```bash
cd frontend
# Открыть index.html в браузере
```

## API

| Endpoint           | Метод  | Описание        |
| ------------------ | ------ | --------------- |
| /api/auth/register | POST   | Регистрация     |
| /api/auth/login    | POST   | Вход            |
| /api/clothes       | GET    | Список одежды   |
| /api/clothes       | POST   | Добавить одежду |
| /api/clothes/{id}  | PUT    | Обновить        |
| /api/clothes/{id}  | DELETE | Удалить         |
| /api/outfits       | GET    | Список outfits  |
| /api/outfits       | POST   | Создать outfit  |
| /api/recommend     | POST   | AI-рекомендация |
| /api/stats         | GET    | Статистика      |
