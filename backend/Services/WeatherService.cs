using System.Globalization;
using System.Text.Json;

namespace MarinaAiStyle.Services;

public class WeatherService
{
    private readonly HttpClient _http;

    public WeatherService(HttpClient http) => _http = http;

    public async Task<WeatherData?> GetWeatherByCityAsync(string city)
    {
        var geoUrl = new Uri($"https://geocoding-api.open-meteo.com/v1/search?name={Uri.EscapeDataString(city)}&count=1&language=ru");
        var geoReq = new HttpRequestMessage(HttpMethod.Get, geoUrl);
        var geoRes = await _http.SendAsync(geoReq);
        if (!geoRes.IsSuccessStatusCode) return null;
        var geoResponse = JsonSerializer.Deserialize<JsonElement>(await geoRes.Content.ReadAsStringAsync());

        if (!geoResponse.TryGetProperty("results", out var results) || results.GetArrayLength() == 0)
            return null;

        var location = results[0];
        var lat = double.Parse(location.GetProperty("latitude").GetRawText(), CultureInfo.InvariantCulture);
        var lon = double.Parse(location.GetProperty("longitude").GetRawText(), CultureInfo.InvariantCulture);
        var name = location.TryGetProperty("name", out var n) ? n.GetString() ?? city : city;

        var weather = await GetWeatherAsync(lat, lon);
        if (weather != null)
            weather.CityName = name;
        return weather;
    }

    public async Task<WeatherData?> GetWeatherAsync(double lat, double lon)
    {
        var url = $"https://api.open-meteo.com/v1/forecast?" +
                  $"latitude={lat.ToString(CultureInfo.InvariantCulture)}&longitude={lon.ToString(CultureInfo.InvariantCulture)}" +
                  $"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
                  $"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
                  $"&timezone=auto&forecast_days=1";

        var req = new HttpRequestMessage(HttpMethod.Get, url);
        var res = await _http.SendAsync(req);
        if (!res.IsSuccessStatusCode) return null;
        var response = JsonSerializer.Deserialize<JsonElement>(await res.Content.ReadAsStringAsync());

        if (response.ValueKind == JsonValueKind.Array)
            response = response[0];

        var current = response.GetProperty("current");
        var daily = response.GetProperty("daily");

        return new WeatherData
        {
            Temperature = double.Parse(current.GetProperty("temperature_2m").GetRawText(), CultureInfo.InvariantCulture),
            Humidity = current.GetProperty("relative_humidity_2m").GetInt32(),
            WindSpeed = double.Parse(current.GetProperty("wind_speed_10m").GetRawText(), CultureInfo.InvariantCulture),
            WeatherCode = current.GetProperty("weather_code").GetInt32(),
            TempMax = double.Parse(daily.GetProperty("temperature_2m_max")[0].GetRawText(), CultureInfo.InvariantCulture),
            TempMin = double.Parse(daily.GetProperty("temperature_2m_min")[0].GetRawText(), CultureInfo.InvariantCulture),
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
            tips.Add("Высокая вероятность дождя — возьми зонт");

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
    public string CityName { get; set; } = string.Empty;
    public double Temperature { get; set; }
    public int Humidity { get; set; }
    public double WindSpeed { get; set; }
    public int WeatherCode { get; set; }
    public double TempMax { get; set; }
    public double TempMin { get; set; }
    public int PrecipitationChance { get; set; }
    public string Description { get; set; } = string.Empty;
}
