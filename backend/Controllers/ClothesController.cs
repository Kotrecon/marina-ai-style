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
public class ClothesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClothesController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ClothesResponse>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? season,
        [FromQuery] string? style)
    {
        var query = _db.Clothes.Where(c => c.UserId == UserId);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(c => c.Category == category);
        if (!string.IsNullOrEmpty(season))
            query = query.Where(c => c.Season == season);
        if (!string.IsNullOrEmpty(style))
            query = query.Where(c => c.Style == style);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ClothesResponse(
                c.Id, c.Name, c.Category, c.Color, c.Material,
                c.Season, c.Style, c.ImagePath, c.WearCount, c.CreatedAt,
                null, c.PhotoData != null))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClothesResponse>> GetById(int id)
    {
        var c = await _db.Clothes.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (c == null) return NotFound();

        var photoBase64 = c.PhotoData != null
            ? $"data:{c.PhotoContentType};base64,{Convert.ToBase64String(c.PhotoData)}"
            : null;

        return Ok(new ClothesResponse(
            c.Id, c.Name, c.Category, c.Color, c.Material,
            c.Season, c.Style, c.ImagePath, c.WearCount, c.CreatedAt,
            PhotoBase64: photoBase64, HasPhoto: c.PhotoData != null));
    }

    [HttpPost]
    public async Task<ActionResult<ClothesResponse>> Create(ClothesCreateRequest request)
    {
        var clothes = new Clothes
        {
            UserId = UserId,
            Name = request.Name,
            Category = request.Category,
            Color = request.Color,
            Material = request.Material,
            Season = request.Season,
            Style = request.Style
        };

        _db.Clothes.Add(clothes);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = clothes.Id },
            new ClothesResponse(
                clothes.Id, clothes.Name, clothes.Category, clothes.Color, clothes.Material,
                clothes.Season, clothes.Style, clothes.ImagePath, clothes.WearCount, clothes.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ClothesCreateRequest request)
    {
        var clothes = await _db.Clothes.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (clothes == null) return NotFound();

        clothes.Name = request.Name;
        clothes.Category = request.Category;
        clothes.Color = request.Color;
        clothes.Material = request.Material;
        clothes.Season = request.Season;
        clothes.Style = request.Style;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var clothes = await _db.Clothes.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (clothes == null) return NotFound();

        _db.Clothes.Remove(clothes);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/photo")]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
    {
        var clothes = await _db.Clothes.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (clothes == null) return NotFound();

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);

        clothes.PhotoData = ms.ToArray();
        clothes.PhotoContentType = file.ContentType;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Photo uploaded" });
    }

    [HttpGet("{id}/photo")]
    public async Task<IActionResult> GetPhoto(int id)
    {
        var clothes = await _db.Clothes.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (clothes == null) return NotFound();
        if (clothes.PhotoData == null) return NotFound();

        return File(clothes.PhotoData, clothes.PhotoContentType ?? "image/jpeg");
    }
}
