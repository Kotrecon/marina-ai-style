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
public class OutfitController : ControllerBase
{
    private readonly AppDbContext _db;

    public OutfitController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<OutfitResponse>>> GetAll()
    {
        var outfits = await _db.Outfits
            .Where(o => o.UserId == UserId)
            .Include(o => o.Items).ThenInclude(i => i.Clothes)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OutfitResponse(
                o.Id,
                o.Name,
                o.Occasion,
                o.Items.Select(i => new ClothesResponse(
                    i.Clothes.Id, i.Clothes.Name, i.Clothes.Category, i.Clothes.Color,
                    i.Clothes.Material, i.Clothes.Season, i.Clothes.Style,
                    i.Clothes.ImagePath, i.Clothes.WearCount, i.Clothes.CreatedAt))
                    .ToList(),
                o.CreatedAt))
            .ToListAsync();

        return Ok(outfits);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OutfitResponse>> GetById(int id)
    {
        var o = await _db.Outfits
            .Include(o => o.Items).ThenInclude(i => i.Clothes)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (o == null) return NotFound();

        return Ok(new OutfitResponse(
            o.Id,
            o.Name,
            o.Occasion,
            o.Items.Select(i => new ClothesResponse(
                i.Clothes.Id, i.Clothes.Name, i.Clothes.Category, i.Clothes.Color,
                i.Clothes.Material, i.Clothes.Season, i.Clothes.Style,
                i.Clothes.ImagePath, i.Clothes.WearCount, i.Clothes.CreatedAt))
                .ToList(),
            o.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<OutfitResponse>> Create(OutfitCreateRequest request)
    {
        var clothesIds = await _db.Clothes
            .Where(c => c.UserId == UserId && request.ClothesIds.Contains(c.Id))
            .Select(c => c.Id)
            .ToListAsync();

        if (clothesIds.Count != request.ClothesIds.Count)
            return BadRequest(new { error = "Some clothes items not found" });

        var outfit = new Outfit
        {
            UserId = UserId,
            Name = request.Name,
            Occasion = request.Occasion,
            Items = clothesIds.Select(id => new OutfitItem { ClothesId = id }).ToList()
        };

        _db.Outfits.Add(outfit);
        await _db.SaveChangesAsync();

        return await GetById(outfit.Id);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var outfit = await _db.Outfits
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (outfit == null) return NotFound();

        _db.Outfits.Remove(outfit);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
