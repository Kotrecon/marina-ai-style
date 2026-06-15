using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("users")]
public class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("city")]
    public string? City { get; set; }

    [Column("gender")]
    public string? Gender { get; set; }

    [Column("age")]
    public int? Age { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Clothes> Clothes { get; set; } = new List<Clothes>();
    public ICollection<Outfit> Outfits { get; set; } = new List<Outfit>();
}
