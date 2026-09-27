import osmnx as ox
import geopandas as gpd

def get_water_candidates():
    tags = {
        "waterway": ["stream", "canal", "drain", "ditch"],
        "natural": "water",
    }

    gdf = ox.features_from_place("Amsterdam, Netherlands", tags=tags)
    gdf = gdf.to_crs(28992)

    candidates = []

    for index, row in gdf.iterrows():
        geometry = row.geometry

        if geometry is None:
            continue

        point = geometry.centroid

        candidates.append({
            "osm_id": str(index),
            "x": point.x,
            "y": point.y,
            "geometry": geometry
        })

    return candidates

GRID_SIZE_mtr = 500

def get_grid_cell(x: float, y: float):
    grid_x = int(x // GRID_SIZE_mtr)
    grid_y = int(y // GRID_SIZE_mtr)

    return grid_x, grid_y


def aggregate_candidates(candidates):
    cells = {}
    for candidate in candidates:
        x = candidate["x"]
        y = candidate["y"]
        cell_x, cell_y = get_grid_cell(x, y)
        key = (cell_x, cell_y)
        if key not in cells:
            cells[key] = {
                "cell_x": cell_x,
                "cell_y": cell_y,
                "count": 0,
                "points": []
            }
        cells[key]["count"] += 1
        cells[key]["points"].append(candidate)
    return list(cells.values())