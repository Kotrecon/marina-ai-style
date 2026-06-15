using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("clothes")]
public class Clothes
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Column("color")]
    public string Color { get; set; } = string.Empty;

    [Column("material")]
    public string Material { get; set; } = string.Empty;

    [Column("season")]
    public string Season { get; set; } = string.Empty;

    [Column("style")]
    public string Style { get; set; } = string.Empty;

    [Column("image_path")]
    public string? ImagePath { get; set; }

    [Column("wear_count")]
    public int WearCount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<OutfitItem> OutfitItems { get; set; } = new List<OutfitItem>();
}
