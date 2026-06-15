# Marina AI Style

> **Русский** | [English](README.md)

AI-ассистент гардероба — загружай одежду с фото, получай персональные рекомендации образов на основе реальной погоды, профиля пользователя и повода.

---

![ASP.NET](https://img.shields.io/badge/ASP.NET-10-512BD4?style=flat&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-13-239120?style=flat&logo=csharp)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat&logo=javascript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat&logo=postgresql)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3)

## Стек

| Слой     | Технологии                  |
| -------- | --------------------------- |
| Фронт    | Vanilla JS / HTML / CSS     |
| Бэкенд   | ASP.NET 10 + C# 13          |
| БД       | PostgreSQL 18               |
| AI       | OpenRouter API              |
| Погода   | Open-Meteo API (бесплатно)  |

## Возможности

- Управление гардеробом с загрузкой фото (хранятся в БД)
- Фильтры по категории, сезону, стилю
- Отображение погоды по городу с геокодингом
- AI-рекомендации образов на основе реальной погоды, профиля (пол, возраст), города, сезона, стиля и повода
- История рекомендаций для каждого пользователя
- Создание образов
- Статистика гардероба
- Профили пользователей с городом по умолчанию, полом и возрастом

## Запуск

### Требования

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 18](https://www.postgresql.org/download/)

### Настройка

```bash
# 1. Создать базу данных
psql -U postgres -c "CREATE DATABASE marina_ai_style;"
psql -U postgres -d marina_ai_style -f migrations/000_initial.sql

# 2. Настроить окружение
cp .env.example .env
# Отредактируйте .env

# 3. Запустить бэкенд
cd backend
dotnet restore
dotnet run

# 4. Открыть фронтенд
# Перейти на http://localhost:5000
```

### Переменные окружения

| Переменная             | Описание                       |
| --------------------- | ------------------------------ |
| `OpenRouter__ApiKey`  | API-ключ OpenRouter            |
| `ConnectionStrings__Default` | Строка подключения PostgreSQL |
| `Jwt__Secret`         | Секрет для подписи JWT         |

## API Эндпоинты

| Метод | Эндпоинт              | Авторизация | Описание                  |
| ----- | --------------------- | ----------- | ------------------------- |
| POST  | `/api/auth/register`  | Нет         | Регистрация (логин, пароль, город, пол, возраст) |
| POST  | `/api/auth/login`     | Нет         | Вход                      |
| PUT   | `/api/auth/profile`   | Да          | Обновление профиля (город, пол, возраст) |
| GET   | `/api/clothes`        | Да          | Список одежды (фильтры: сезон, категория, стиль) |
| POST  | `/api/clothes`        | Да          | Добавить одежду           |
| GET   | `/api/clothes/{id}`   | Да          | Детали одежды             |
| POST  | `/api/clothes/{id}/photo` | Да      | Загрузить фото            |
| GET   | `/api/clothes/{id}/photo` | Да      | Получить фото             |
| DELETE| `/api/clothes/{id}`   | Да          | Удалить одежду            |
| GET   | `/api/outfit`         | Да          | Список образов            |
| POST  | `/api/outfit`         | Да          | Создать образ             |
| DELETE| `/api/outfit/{id}`    | Да          | Удалить образ             |
| GET   | `/api/recommend`      | Да          | История рекомендаций      |
| POST  | `/api/recommend`      | Да          | AI-рекомендация (город, сезон, стиль, повод) |
| GET   | `/api/recommend/weather` | Да      | Погода по городу          |
| GET   | `/api/stats`          | Да          | Статистика гардероба      |

## Структура проекта

```
marina-ai-style/
├── backend/
│   ├── Controllers/      # API эндпоинты
│   ├── Models/           # Сущности и DTO
│   ├── Services/         # Бизнес-логика (Auth, Weather, AI)
│   ├── Data/             # DbContext
│   └── Program.cs        # Конфигурация приложения
├── frontend/
│   ├── components/       # JS-модули (auth, wardrobe, outfits, recommend, stats)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── migrations/           # SQL-миграции
├── .env                  # Конфигурация окружения (git-ignored)
└── marina_ai_style.sql   # Полная схема БД
```

## Автор

**[@Kotrecon](https://github.com/Kotrecon)**

Архитектор решений из Санкт-Петербурга. Специализация: .NET, C#, JS, Python, AI/ML, RAG, Агенты, DevOps, GitHub, GitLab, CI/CD, АСУ ТП, промышленное ПО, DB, PostgreSQL.
[Telegram](https://t.me/Kotrecon) | [Email](mailto:ermakov_k@mail.ru)

---

## Лицензия

MIT
