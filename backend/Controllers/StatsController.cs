using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MarinaAiStyle.Data;
using MarinaAiStyle.Models;

namespace MarinaAiStyle.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StatsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<StatsResponse>> GetStats()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var clothes = await _db.Clothes.Where(c => c.UserId == userId).ToListAsync();
        var outfits = await _db.Outfits.Where(o => o.UserId == userId).ToListAsync();

        var byCategory = clothes
            .GroupBy(c => c.Category)
            .Select(g => new CategoryStat(g.Key, g.Count()))
            .OrderByDescending(s => s.Count)
            .ToList();

        var bySeason = clothes
            .GroupBy(c => c.Season)
            .Select(g => new SeasonStat(g.Key, g.Count()))
            .OrderByDescending(s => s.Count)
            .ToList();

        var byColor = clothes
            .GroupBy(c => c.Color)
            .Select(g => new ColorStat(g.Key, g.Count()))
            .OrderByDescending(s => s.Count)
            .ToList();

        var mostWorn = clothes
            .OrderByDescending(c => c.WearCount)
            .Take(5)
            .Select(c => new ClothesResponse(
                c.Id, c.Name, c.Category, c.Color, c.Material,
                c.Season, c.Style, c.ImagePath, c.WearCount, c.CreatedAt))
            .ToList();

        return Ok(new StatsResponse(
            TotalClothes: clothes.Count,
            TotalOutfits: outfits.Count,
            TotalWears: clothes.Sum(c => c.WearCount),
            ByCategory: byCategory,
            BySeason: bySeason,
            ByColor: byColor,
            MostWorn: mostWorn
        ));
    }
}
