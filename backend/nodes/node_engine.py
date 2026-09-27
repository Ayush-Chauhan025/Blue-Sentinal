from .candidates import (get_water_candidates, aggregate_candidates)
from .weather import get_weather
from .risk import (calculate_risk, water_proximity_score, persistence_score)
import httpx
import geopandas as gpd
from shapely.geometry import Point
from fastapi import APIRouter, Request, HTTPException

router = APIRouter(tags=["Risk node generation"])

@router.get("/api/nodes")
async def get_nodes():
    candidates = get_water_candidates()
    cells = aggregate_candidates(candidates)
    nodes = []
    weather = await get_weather(52.3676, 4.9041)
    for cell in cells:
        points = cell["points"]

        avg_x = sum(p["x"] for p in points) / len(points)
        avg_y = sum(p["y"] for p in points) / len(points)

        point = gpd.GeoSeries([Point(avg_x, avg_y)],crs=28992).to_crs(4326).iloc[0]

        lng = point.x
        lat = point.y
        water_score = water_proximity_score(cell["count"])
        persistence = persistence_score(cell["count"])

        risk = calculate_risk(
            rainfall=weather["rainfall_24h"],
            water_proximity=water_score,
            temperature=weather["temperature"],
            persistence=persistence
        )

        if risk < 65:
            continue

        node = {
            "id": f"SN-{len(nodes) + 1:03d}",
            "latitude": lat,
            "longitude": lng,
            "risk_score": risk,
            "risk_level": ("high" if risk >= 80 else "medium"),
            "rainfall_24h": weather[ "rainfall_24h"],
            "temperature": weather["temperature"],
            "water_feature_count": cell["count"],
            "status": "predicted"
        }
        nodes.append(node)

    try:
        httpx.post("http://localhost:3000/api/nodes/sync", json={"nodes": nodes})
        print(f"Successfully pushed {len(nodes)} nodes to Next.js Database")
    except Exception as e:
        print(f"Failed to sync with Next.js DB: {e}")

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": node["id"],
                    "risk_score": node["risk_score"],
                    "risk_level": node["risk_level"],
                    "rainfall_24h": node["rainfall_24h"],
                    "temperature": node["temperature"],
                    "status": node["status"]
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [node["longitude"],node["latitude"]]
                }
            }
            for node in nodes
        ]
    }