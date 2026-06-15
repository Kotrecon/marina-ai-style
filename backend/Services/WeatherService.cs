using System.Text.Json;

namespace MarinaAiStyle.Services;

public class WeatherService
{
    private readonly HttpClient _http;

    public WeatherService(HttpClient http) => _http = http;

    public async Task<WeatherData> GetWeatherAsync(double lat, double lon)
    {
        var url = $"https://api.open-meteo.com/v1/forecast?" +
                  $"latitude={lat}&longitude={lon}" +
                  $"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
                  $"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
                  $"&timezone=auto&forecast_days=1";

        var response = await _http.GetFromJsonAsync<JsonElement>(url);

        if (response.ValueKind == JsonValueKind.Array)
            response = response[0];

        var current = response.GetProperty("current");
        var daily = response.GetProperty("daily");

        return new WeatherData
        {
            Temperature = current.GetProperty("temperature_2m").GetDouble(),
            Humidity = current.GetProperty("relative_humidity_2m").GetInt32(),
            WindSpeed = current.GetProperty("wind_speed_10m").GetDouble(),
            WeatherCode = current.GetProperty("weather_code").GetInt32(),
            TempMax = daily.GetProperty("temperature_2m_max")[0].GetDouble(),
            TempMin = daily.GetProperty("temperature_2m_min")[0].GetDouble(),
            PrecipitationChance = daily.GetProperty("precipitation_probability_max")[0].GetInt32(),
            Description = MapWeatherCode(current.GetProperty("weather_code").GetInt32())
        };
    }

    public string GetSeasonFromTemp(double tempC)
    {
        return tempC switch
        {
            < 0 => "зима",
            < 10 => "осень",
            < 20 => "весна",
            _ => "лето"
        };
    }

    public string GetStyleAdvice(WeatherData weather)
    {
        var tips = new List<string>();

        if (weather.Temperature < 0)
            tips.Add("Одевайся тепло: куртка, шапка, шарф, перчатки");
        else if (weather.Temperature < 10)
            tips.Add("Нужна тёплая куртка или пиджак");
        else if (weather.Temperature < 20)
            tips.Add("Комфортная температура — лёгкий слой одежды");
        else
            tips.Add("Тепло — лёгкая одежда, избегай тяжёлых тканей");

        if (weather.PrecipitationChance > 50)
            tips.Add("Высокая вероятность дождя — возьми зонт,避开 лёгкие ткани");

        if (weather.WindSpeed > 20)
            tips.Add("Сильный ветер — избегай свободных вещей");

        if (weather.Humidity > 80)
            tips.Add("Высокая влажность — предпочтение натуральным тканям");

        return string.Join(". ", tips);
    }

    private static string MapWeatherCode(int code) => code switch
    {
        0 => "Ясно",
        1 or 2 or 3 => "Облачно",
        45 or 48 => "Туман",
        51 or 53 or 55 => "Морось",
        61 or 63 or 65 => "Дождь",
        71 or 73 or 75 => "Снег",
        80 or 81 or 82 => "Ливень",
        95 => "Гроза",
        _ => "Неизвестно"
    };
}

public class WeatherData
{
    public double Temperature { get; set; }
    public int Humidity { get; set; }
    public double WindSpeed { get; set; }
    public int WeatherCode { get; set; }
    public double TempMax { get; set; }
    public double TempMin { get; set; }
    public int PrecipitationChance { get; set; }
    public string Description { get; set; } = string.Empty;
}
