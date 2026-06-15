# Marina AI Style

> [Русский](README.ru.md) | **English**

AI-powered wardrobe assistant — upload your clothes with photos, get personalized outfit recommendations based on real-time weather, user profile, and occasion.

---

![ASP.NET](https://img.shields.io/badge/ASP.NET-10-512BD4?style=flat&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-13-239120?style=flat&logo=csharp)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat&logo=javascript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat&logo=postgresql)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3)

## Tech Stack

| Layer    | Tech                        |
| -------- | --------------------------- |
| Frontend | Vanilla JS / HTML / CSS     |
| Backend  | ASP.NET 10 + C# 13          |
| Database | PostgreSQL 18               |
| AI       | OpenRouter API              |
| Weather  | Open-Meteo API (free)       |

## Features

- Wardrobe management with photo upload (stored in DB)
- Filter by category, season, style
- City-based weather display with geocoding
- AI outfit recommendations based on real-time weather, user profile (gender, age), city, season, style, and occasion
- Recommendation history per user
- Outfit builder
- Wardrobe statistics
- User profiles with default city, gender, and age

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 18](https://www.postgresql.org/download/)

### Setup

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE marina_ai_style;"
psql -U postgres -d marina_ai_style -f migrations/000_initial.sql

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Run backend
cd backend
dotnet restore
dotnet run

# 4. Open frontend
# Navigate to http://localhost:5000
```

### Environment Variables

| Variable              | Description                    |
| --------------------- | ------------------------------ |
| `OpenRouter__ApiKey`  | OpenRouter API key             |
| `ConnectionStrings__Default` | PostgreSQL connection string |
| `Jwt__Secret`         | JWT signing secret             |

## API Endpoints

| Method | Endpoint              | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register`  | No   | Register (username, password, city, gender, age) |
| POST   | `/api/auth/login`     | No   | Login                    |
| PUT    | `/api/auth/profile`   | Yes  | Update profile (city, gender, age) |
| GET    | `/api/clothes`        | Yes  | List clothes (with filters: season, category, style) |
| POST   | `/api/clothes`        | Yes  | Add clothes              |
| GET    | `/api/clothes/{id}`   | Yes  | Get clothes details      |
| POST   | `/api/clothes/{id}/photo` | Yes | Upload photo for clothes |
| GET    | `/api/clothes/{id}/photo` | Yes | Get clothes photo    |
| DELETE | `/api/clothes/{id}`   | Yes  | Delete clothes           |
| GET    | `/api/outfit`         | Yes  | List outfits             |
| POST   | `/api/outfit`         | Yes  | Create outfit            |
| DELETE | `/api/outfit/{id}`    | Yes  | Delete outfit            |
| GET    | `/api/recommend`      | Yes  | Recommendation history   |
| POST   | `/api/recommend`      | Yes  | Get AI recommendation (city, season, style, occasion) |
| GET    | `/api/recommend/weather` | Yes | Get weather by city   |
| GET    | `/api/stats`          | Yes  | Wardrobe statistics      |

## Project Structure

```
marina-ai-style/
├── backend/
│   ├── Controllers/      # API endpoints
│   ├── Models/           # Entities & DTOs
│   ├── Services/         # Business logic (Auth, Weather, AI)
│   ├── Data/             # DbContext
│   └── Program.cs        # App config
├── frontend/
│   ├── components/       # JS modules (auth, wardrobe, outfits, recommend, stats)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── migrations/           # SQL migrations
├── .env                  # Environment config (git-ignored)
└── marina_ai_style.sql   # Full DB schema
```

## Author

**[@Kotrecon](https://github.com/Kotrecon)**

Solution architect from Saint Petersburg. Specialization: .NET, C#, JS, Python, AI/ML, RAG, Agents, DevOps, GitHub, GitLab, CI/CD, Industrial Software, DB, PostgreSQL.
[Telegram](https://t.me/Kotrecon) | [Email](mailto:ermakov_k@mail.ru)

---

## License

MIT
