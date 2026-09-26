from fastapi import FastAPI
import osmnx as ox
from routers import route_engine
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading network_graph.graphml into memory")
    # Load graph and attach it to the app state so routers can access it
    graph = ox.load_graphml("../pipeline/network_graph.graphml")
    for u, v, key, data in graph.edges(keys=True, data=True):
        if 'blue_weight' in data:
            data['blue_weight'] = float(data['blue_weight'])
    app.state.graph= graph
    print("Graph loaded successfully!")
    yield
    print("Shutting down")

app = FastAPI(title="BlueSentinal Server",  lifespan=lifespan)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

app.include_router(route_engine.router, prefix="/api/v1")

@app.get('/')
def server_check():
    return {
        "status": "Server is running"
    }