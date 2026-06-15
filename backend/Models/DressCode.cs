using System.ComponentModel.DataAnnotations.Schema;

namespace MarinaAiStyle.Models;

[Table("dress_codes")]
public class DressCode
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("required_categories")]
    public string RequiredCategories { get; set; } = string.Empty;
}
