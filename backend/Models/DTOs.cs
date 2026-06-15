namespace MarinaAiStyle.Models;

public record RegisterRequest(string Username, string Password, string? City = null, string? Gender = null, int? Age = null);
public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string Username, string? City, string? Gender, int? Age);

public record ClothesCreateRequest(string Name, string Category, string Color, string Material, string Season, string Style);
public record ClothesResponse(int Id, string Name, string Category, string Color, string Material, string Season, string Style, string? ImagePath, int WearCount, DateTime CreatedAt, string? PhotoBase64 = null, bool HasPhoto = false);

public record OutfitCreateRequest(string Name, string Occasion, List<int> ClothesIds);
public record OutfitResponse(int Id, string Name, string Occasion, List<ClothesResponse> Items, DateTime CreatedAt);

public record DressCodeResponse(int Id, string Name, string RequiredCategories);

public record RecommendRequest(string Season, string? City = null, string? Style = null, string? Occasion = null, string? Gender = null, int? Age = null);
public record RecommendResponse(List<ClothesResponse> Items, string Advice);

public record StatsResponse(
    int TotalClothes,
    int TotalOutfits,
    int TotalWears,
    List<CategoryStat> ByCategory,
    List<SeasonStat> BySeason,
    List<ColorStat> ByColor,
    List<ClothesResponse> MostWorn
);

public record CategoryStat(string Category, int Count);
public record SeasonStat(string Season, int Count);
public record ColorStat(string Color, int Count);