using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using MarinaAiStyle.Data;
using MarinaAiStyle.Models;
using MarinaAiStyle.Services;

namespace MarinaAiStyle.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class RecommendController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly WeatherService _weather;
    private readonly AIRecommendationService _ai;

    public RecommendController(AppDbContext db, WeatherService weather, AIRecommendationService ai)
    {
        _db = db;
        _weather = weather;
        _ai = ai;
    }

    [HttpGet("weather")]
    public async Task<ActionResult<WeatherResponse>> GetWeather([FromQuery] string city)
    {
        if (string.IsNullOrEmpty(city))
            return BadRequest(new { error = "Укажите город" });

        var data = await _weather.GetWeatherByCityAsync(city);
        if (data == null)
            return NotFound(new { error = "Город не найден" });

        return Ok(new WeatherResponse(
            data.CityName, data.Temperature, data.TempMin, data.TempMax,
            data.Description, data.Humidity, data.WindSpeed, data.PrecipitationChance));
    }

    [HttpGet]
    public async Task<ActionResult<List<RecommendationResponse>>> GetHistory()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var items = await _db.Recommendations
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RecommendationResponse(
                r.Id, r.Season, r.City, r.Occasion, r.Advice,
                JsonSerializer.Deserialize<List<ClothesResponse>>(r.ItemsSnapshot) ?? new(),
                r.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<RecommendationResponse>> Recommend(RecommendRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var wardrobeQuery = _db.Clothes
            .Where(c => c.UserId == userId && c.Season == request.Season);

        if (!string.IsNullOrEmpty(request.Style))
            wardrobeQuery = wardrobeQuery.Where(c => c.Style == request.Style);

        var wardrobe = await wardrobeQuery
            .Select(c => new ClothesResponse(
                c.Id, c.Name, c.Category, c.Color, c.Material,
                c.Season, c.Style, c.ImagePath, c.WearCount, c.CreatedAt))
            .ToListAsync();

        if (wardrobe.Count == 0)
            return BadRequest(new { error = "Нет одежды для этого сезона" });

        var city = string.IsNullOrEmpty(request.City) ? "Санкт-Петербург" : request.City;
        var weatherData = await _weather.GetWeatherByCityAsync(city);
        if (weatherData == null)
            return BadRequest(new { error = $"Город '{city}' не найден" });

        var user = await _db.Users.FindAsync(userId);
        var gender = user?.Gender;
        var age = user?.Age;

        var result = await _ai.GetRecommendationAsync(weatherData, wardrobe, request.Occasion, gender, age, request.Season, request.Style);

        var recommendedItems = wardrobe
            .Where(c => result.RecommendedIds.Contains(c.Id))
            .ToList();

        var rec = new Recommendation
        {
            UserId = userId,
            Season = request.Season,
            City = city,
            Occasion = request.Occasion,
            Advice = result.Advice,
            ItemsSnapshot = JsonSerializer.Serialize(recommendedItems)
        };

        _db.Recommendations.Add(rec);
        await _db.SaveChangesAsync();

        var weatherResp = new WeatherResponse(
            weatherData.CityName, weatherData.Temperature, weatherData.TempMin, weatherData.TempMax,
            weatherData.Description, weatherData.Humidity, weatherData.WindSpeed, weatherData.PrecipitationChance);

        return Ok(new RecommendationResponse(
            rec.Id, rec.Season, rec.City, rec.Occasion, rec.Advice,
            recommendedItems, rec.CreatedAt, weatherResp));
    }
}

public record WeatherResponse(
    string City, double Temperature, double TempMin, double TempMax,
    string Description, int Humidity, double WindSpeed, int PrecipitationChance);

public record RecommendationResponse(
    int Id, string Season, string? City, string? Occasion, string Advice,
    List<ClothesResponse> Items, DateTime CreatedAt, WeatherResponse? Weather = null);
