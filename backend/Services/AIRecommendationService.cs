using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using MarinaAiStyle.Models;

namespace MarinaAiStyle.Services;

public class AIRecommendationService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public AIRecommendationService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<RecommendResult> GetRecommendationAsync(
        WeatherData weather,
        List<ClothesResponse> wardrobe,
        string? occasion,
        string? gender = null,
        int? age = null,
        string? season = null,
        string? style = null)
    {
        var prompt = BuildPrompt(weather, wardrobe, occasion, gender, age, season, style);

        var requestBody = new
        {
            model = "nex-agi/nex-n2-pro:free",
            messages = new[]
            {
                new { role = "system", content = "Ты стилист. ПРАВИЛА: 1) Выбери ОБЯЗАТЕЛЬНО минимум 2 вещи — одну для верха, одну для низа. 2) Формат ответа: каждая вещь на новой строке в формате: [ID] Название — совет. 3) Не пиши что в гардеробе не хватает вещей — работай только с тем что есть. 4) В конце дай короткий совет по образу." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7,
            max_tokens = 500
        };

        var requestBodyJson = JsonSerializer.Serialize(requestBody);
        var apiKey = _config["OpenRouter:ApiKey"];

        HttpRequestMessage CreateRequest() =>
            new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
            {
                Content = new StringContent(requestBodyJson, Encoding.UTF8, "application/json"),
                Headers = { Authorization = new AuthenticationHeaderValue("Bearer", apiKey) }
            };

        var response = await _http.SendAsync(CreateRequest());

        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            var retryAfter = response.Headers.RetryAfter?.Delta?.Seconds ?? 30;
            await Task.Delay(retryAfter * 1000);
            response = await _http.SendAsync(CreateRequest());
        }

        var responseStr = await response.Content.ReadAsStringAsync();
        var json = JsonSerializer.Deserialize<JsonElement>(responseStr);

        if (json.TryGetProperty("error", out var errorProp))
        {
            var errorMsg = errorProp.TryGetProperty("message", out var msg) ? msg.GetString() : "Неизвестная ошибка API";
            return new RecommendResult(
                Advice: $"Ошибка AI: {errorMsg}",
                RecommendedIds: []);
        }

        var content = json
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "Нет рекомендации";

        var recommendedIds = MatchItems(content, wardrobe);

        return new RecommendResult(Advice: content, RecommendedIds: recommendedIds);
    }

    private string BuildPrompt(WeatherData weather, List<ClothesResponse> wardrobe, string? occasion, string? gender, int? age, string? season, string? style)
    {
        var sb = new StringBuilder();

        sb.AppendLine("=== ПОГОДА ===");
        sb.AppendLine($"Город: {weather.CityName}");
        sb.AppendLine($"Температура: {weather.Temperature}°C (от {weather.TempMin} до {weather.TempMax})");
        sb.AppendLine($"Погода: {weather.Description}");
        sb.AppendLine($"Влажность: {weather.Humidity}%");
        sb.AppendLine($"Ветер: {weather.WindSpeed} м/с");
        sb.AppendLine($"Дождь: {weather.PrecipitationChance}%");

        if (!string.IsNullOrEmpty(season))
            sb.AppendLine($"\n=== СЕЗОН ===\n{season}");

        if (!string.IsNullOrEmpty(style))
            sb.AppendLine($"\n=== СТИЛЬ ===\n{style}");

        if (!string.IsNullOrEmpty(occasion))
            sb.AppendLine($"\n=== ПОВОД ===\n{occasion}");

        if (!string.IsNullOrEmpty(gender) || age.HasValue)
        {
            sb.AppendLine("\n=== ПОЛЬЗОВАТЕЛЬ ===");
            if (!string.IsNullOrEmpty(gender))
                sb.AppendLine($"Пол: {gender}");
            if (age.HasValue)
                sb.AppendLine($"Возраст: {age} лет");
        }

        sb.AppendLine("\n=== ГАРДЕРОБ ===");
        foreach (var item in wardrobe)
            sb.AppendLine($"[{item.Id}] {item.Name} | {item.Category} | {item.Color} | {item.Material} | {item.Season} | {item.Style}");

        sb.AppendLine("\nВАЖНО: Подбери полный образ. МИНИМУМ 2 вещи — одна для верха (рубашка/поло/футболка), одна для низа (джинсы/брюки/юбка). Формат: [ID] Название — совет. Не пиши про отсутствующие вещи.");

        return sb.ToString();
    }

    private static List<int> MatchItems(string response, List<ClothesResponse> wardrobe)
    {
        var ids = new List<int>();
        var lower = response.ToLower();
        foreach (var item in wardrobe)
        {
            if (response.Contains($"[{item.Id}]") || lower.Contains(item.Name.ToLower()))
                ids.Add(item.Id);
        }
        return ids;
    }
}

public record RecommendResult(string Advice, List<int> RecommendedIds);
