using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("outfit_items")]
public class OutfitItem
{
    [Column("outfit_id")]
    public int OutfitId { get; set; }

    [Column("clothes_id")]
    public int ClothesId { get; set; }

    public Outfit Outfit { get; set; } = null!;
    public Clothes Clothes { get; set; } = null!;
}
