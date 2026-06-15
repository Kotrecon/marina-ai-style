using Microsoft.EntityFrameworkCore;
using MarinaAiStyle.Models;

namespace MarinaAiStyle.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Clothes> Clothes => Set<Clothes>();
    public DbSet<Outfit> Outfits => Set<Outfit>();
    public DbSet<OutfitItem> OutfitItems => Set<OutfitItem>();
    public DbSet<DressCode> DressCodes => Set<DressCode>();
    public DbSet<Recommendation> Recommendations => Set<Recommendation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Username).HasMaxLength(50);
        });

        modelBuilder.Entity<Clothes>(e =>
        {
            e.HasIndex(c => new { c.UserId, c.Name });
            e.Property(c => c.Category).HasMaxLength(50);
            e.Property(c => c.Color).HasMaxLength(50);
            e.Property(c => c.Season).HasMaxLength(20);
            e.Property(c => c.Style).HasMaxLength(30);
        });

        modelBuilder.Entity<OutfitItem>(e =>
        {
            e.HasKey(oi => new { oi.OutfitId, oi.ClothesId });
        });

        modelBuilder.Entity<DressCode>(e =>
        {
            e.Property(d => d.Name).HasMaxLength(50);
        });
    }
}
