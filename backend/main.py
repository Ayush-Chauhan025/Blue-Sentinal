from fastapi import FastAPI
import osmnx as ox
from routers import route_engine
from nodes import node_engine
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

async def run_risk_engine():
    print("\nRisk Node Generation...")
    try:
        await node_engine.get_nodes()
        print("Node gen completed successfully.")
    except Exception as e:
        print(f"Node gen failed: {e}")


async def run_database_cleanup():
    print("\n Running Database Cleanup...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3000/api/nodes/cleanup")
            print(f"Cleanup Result: {response.json()}")
    except Exception as e:
        print(f"Cleanup failed: {e}")


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

    scheduler = AsyncIOScheduler()

    scheduler.add_job(run_risk_engine, 'cron', hour=8, minute=0)
    scheduler.add_job(run_database_cleanup, 'cron', hour=0, minute=0)
    
    scheduler.start()

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
app.include_router(node_engine.router, prefix="/api/v1")

@app.get('/')
def server_check():
    return {
        "status": "Server is running"
    }