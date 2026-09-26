from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import osmnx as ox
import networkx as nx

router = APIRouter(tags=["Routing Engine"])

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

@router.post("/get-route")
def calculate_route(payload: RouteRequest, request: Request):
    graph = request.app.state.graph
    
    # Find nearest nodes (x=longitude, y=latitude)
    start_node = ox.distance.nearest_nodes(graph, X=payload.start_lng, Y=payload.start_lat)
    end_node = ox.distance.nearest_nodes(graph, X=payload.end_lng, Y=payload.end_lat)

    # Find shortest Path
    try:
        standard_path = nx.shortest_path(graph, source=start_node, target=end_node, weight='length')
        blue_path = nx.shortest_path(graph, source=start_node, target=end_node, weight='blue_weight')
    except nx.NetworkXNoPath:
        raise HTTPException(status_code=404, detail='No Path Found b/w two coordinates')

    # calc distance
    standard_len = nx.path_weight(graph, standard_path, weight="length")
    blue_len = nx.path_weight(graph, blue_path, weight="length")

    # pull [lng, lat] for every node in the paths
    standard_coords = [[graph.nodes[n]["x"], graph.nodes[n]["y"]] for n in standard_path]
    blue_coords = [[graph.nodes[n]["x"], graph.nodes[n]["y"]] for n in blue_path]

    return {
        "status": "success",
        "standard_route": standard_coords,
        "blue_route": blue_coords,
        "standard_route_length": standard_len,
        "blue_route_length": blue_len
    }