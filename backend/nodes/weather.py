import httpx

async def get_weather(lat: float, lng: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "hourly": "temperature_2m,rain",
        "past_hours": 24,
        "forecast_hours": 1,
        "timezone": "UTC",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        print(data)
    hourly = data["hourly"]
    rainfall = hourly["rain"]

    total_rainfall = sum(value or 0 for value in rainfall)

    temperatures = [value for value in hourly["temperature_2m"] if value is not None]

    temperature = (temperatures[-1] if temperatures else 20)

    return {
        "rainfall_24h": total_rainfall,
        "temperature": temperature
    }