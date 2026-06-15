using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("recommendations")]
public class Recommendation
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("season")]
    public string Season { get; set; } = string.Empty;

    [Column("occasion")]
    public string? Occasion { get; set; }

    [Column("city")]
    public string? City { get; set; }

    [Column("advice")]
    public string Advice { get; set; } = string.Empty;

    [Column("items_snapshot")]
    public string ItemsSnapshot { get; set; } = "[]";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
