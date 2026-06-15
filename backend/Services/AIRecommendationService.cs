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
        string? occasion)
    {
        var prompt = BuildPrompt(weather, wardrobe, occasion);

        var requestBody = new
        {
            model = "openai/gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "Ты стилист-консультант. Подбираешь одежду из гардероба пользователя с учётом погоды и повода. Отвечай на русском. Формат: список вещей (название) и короткий совет." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7,
            max_tokens = 500
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json")
        };

        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer", _config["OpenRouter:ApiKey"]);

        var response = await _http.SendAsync(request);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (json.TryGetProperty("error", out _))
            return new RecommendResult(
                Advice: "Не удалось получить рекомендацию. Проверьте API-ключ.",
                RecommendedIds: []);

        var content = json
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "Нет рекомендации";

        var recommendedIds = MatchItems(content, wardrobe);

        return new RecommendResult(Advice: content, RecommendedIds: recommendedIds);
    }

    private string BuildPrompt(WeatherData weather, List<ClothesResponse> wardrobe, string? occasion)
    {
        var sb = new StringBuilder();

        sb.AppendLine("=== ПОГОДА ===");
        sb.AppendLine($"Температура: {weather.Temperature}°C (от {weather.TempMin} до {weather.TempMax})");
        sb.AppendLine($"Погода: {weather.Description}");
        sb.AppendLine($"Влажность: {weather.Humidity}%");
        sb.AppendLine($"Ветер: {weather.WindSpeed} м/с");
        sb.AppendLine($"Дождь: {weather.PrecipitationChance}%");

        if (!string.IsNullOrEmpty(occasion))
            sb.AppendLine($"\n=== ПОВОД ===\n{occasion}");

        sb.AppendLine("\n=== ГАРДЕРОБ ===");
        foreach (var item in wardrobe)
            sb.AppendLine($"[{item.Id}] {item.Name} | {item.Category} | {item.Color} | {item.Material} | {item.Season} | {item.Style}");

        sb.AppendLine("\nПодбери подходящий outfit из моего гардероба. Укажи ID вещей в формате [ID] и дай совет.");

        return sb.ToString();
    }

    private static List<int> MatchItems(string response, List<ClothesResponse> wardrobe)
    {
        var ids = new List<int>();
        foreach (var item in wardrobe)
        {
            if (response.Contains($"[{item.Id}]"))
                ids.Add(item.Id);
        }
        return ids;
    }
}

public record RecommendResult(string Advice, List<int> RecommendedIds);
