using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("outfits")]
public class Outfit
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("occasion")]
    public string Occasion { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<OutfitItem> Items { get; set; } = new List<OutfitItem>();
}
