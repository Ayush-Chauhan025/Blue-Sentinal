import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import LineString

# get network
place_name = "Amsterdam, Netherlands"
path_graph = ox.graph_from_place(place_name, network_type="all")

tags = {
    "natural":["water", "wetland"],
    "waterway": ["river", "stream", "canal"],
    "water": ["lake", "pond", "reservoir", "lagoon", "basin", "river"],
}
water_features = ox.features_from_place(place_name, tags=tags)

# convert to UTM
path_graph_projected = ox.project_graph(path_graph)
graph_crs = path_graph_projected.graph["crs"]
water_features_projected = water_features.to_crs(graph_crs)

water_features_combined = water_features_projected.geometry.union_all()

# add custom weights to graph based on water source distance
for u, v, key, data in path_graph_projected.edges(keys=True, data=True):
    if 'geometry' in data:
        line = data['geometry']
    else:
        node_u = path_graph_projected.nodes[u]
        node_v = path_graph_projected.nodes[v]
        line = LineString([(node_u['x'], node_u['y']), (node_v['x'], node_v['y'])])

    # distance to water
    distance = line.distance(water_features_combined)

    # actual length
    actual_length = data['length']

    # getting weight
    if distance <= 20:
        blue_weight = 0.2 * actual_length
    elif distance <= 50:
        blue_weight = 0.4 * actual_length
    elif distance <= 100:
        blue_weight = 0.8 * actual_length
    else:
        blue_weight = 1.6 * actual_length

    data['blue_weight'] = blue_weight

# convert to coordinate
path_graph_unprojected = ox.project_graph(path_graph_projected, to_latlong=True)

# save graph
print("Saving graph")
ox.save_graphml(path_graph_unprojected, "network_graph.graphml")
print("network_graph.graphml is ready.")