def rainfall_score(rainfall_mm: float) -> float:
    if rainfall_mm < 5: return 10
    if rainfall_mm < 10: return 30
    if rainfall_mm < 20: return 50
    if rainfall_mm < 40: return 75
    return 100

def temperature_score(temp: float) -> float:
    if temp < 15: return 10
    if temp < 20: return 30
    if temp < 25: return 50
    if temp < 30: return 75
    return 100

def water_proximity_score(water_feature_count: int) -> float:
    if water_feature_count >= 5: return 100
    if water_feature_count >= 3: return 80
    if water_feature_count >= 2: return 60
    return 40

def persistence_score(water_feature_count: int) -> float:
    if water_feature_count >= 5: return 90
    if water_feature_count >= 3: return 70
    if water_feature_count >= 2: return 50
    return 30

def calculate_risk( rainfall: float, water_proximity: float, temperature: float, persistence: float):
    r = rainfall_score(rainfall)
    t = temperature_score(temperature)

    score = 0.45 * r + 0.25 * water_proximity + 0.15 * t + 0.15 * persistence
    return round(score, 2)