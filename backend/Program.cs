using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MarinaAiStyle.Data;
using MarinaAiStyle.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

var envFile = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        var idx = trimmed.IndexOf('=');
        if (idx > 0)
        {
            var key = trimmed[..idx].Trim().Replace("__", ":");
            var val = trimmed[(idx + 1)..].Trim();
            builder.Configuration[key] = val;
        }
    }
}

builder.Services.AddControllers();
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 10 * 1024 * 1024);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<AuthService>();
builder.Services.AddHttpClient<WeatherService>();
builder.Services.AddHttpClient<AIRecommendationService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

var app = builder.Build();

app.UseExceptionHandler(error =>
{
    error.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var message = exception switch
        {
            Microsoft.EntityFrameworkCore.DbUpdateException dbEx => dbEx.InnerException?.Message ?? dbEx.Message,
            _ => exception?.Message ?? "Внутренняя ошибка сервера"
        };
        await context.Response.WriteAsJsonAsync(new { error = message });
    });
});

var frontendPath = Path.GetFullPath(Path.Combine(
    Directory.GetCurrentDirectory(),
    builder.Configuration["Frontend:Path"] ?? "../frontend"));
var fileProvider = new PhysicalFileProvider(frontendPath);

app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html", new StaticFileOptions { FileProvider = fileProvider });

app.Run();