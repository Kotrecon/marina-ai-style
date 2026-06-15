using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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

    [HttpPost]
    public async Task<ActionResult<RecommendResponse>> Recommend(RecommendRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var wardrobe = await _db.Clothes
            .Where(c => c.UserId == userId && c.Season == request.Season)
            .Select(c => new ClothesResponse(
                c.Id, c.Name, c.Category, c.Color, c.Material,
                c.Season, c.Style, c.ImagePath, c.WearCount, c.CreatedAt))
            .ToListAsync();

        if (wardrobe.Count == 0)
            return BadRequest(new { error = "Нет одежды для этого сезона" });

        var weather = await _weather.GetWeatherAsync(55.75, 37.62);

        var result = await _ai.GetRecommendationAsync(weather, wardrobe, request.Occasion);

        var recommendedItems = wardrobe
            .Where(c => result.RecommendedIds.Contains(c.Id))
            .ToList();

        return Ok(new RecommendResponse(
            Items: recommendedItems,
            Advice: result.Advice));
    }
}
