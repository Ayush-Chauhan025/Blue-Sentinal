import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function boundingBox(route: [number, number][], radius_m: number){
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const [lng, lat] of route) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
    }

     const latPadding = radius_m / 111_320;

    const centerLat = (minLat + maxLat) / 2;
    const lngPadding = radius_m / (111_320 * Math.cos(centerLat * Math.PI / 180));

    return {
        minLat: minLat - latPadding,
        maxLat: maxLat + latPadding,
        minLng: minLng - lngPadding,
        maxLng: maxLng + lngPadding,
    };
}

export async function POST(req: Request){
    try {
        const body = await req.json();
        
        const routesReq = await fetch("http://localhost:8000/api/v1/get-route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        
        const routeData = await routesReq.json();
        
        const box = boundingBox(routeData.blue_route, 100);

        const nodesQuery = await prisma.node.findMany({
            where: {
                status: "ACTIVE",
                lat: {
                    gte: box.minLat,
                    lte: box.maxLat,
                },
                lng: {
                    gte: box.minLng,
                    lte: box.maxLng,
                },
            },
        })

        const nodes = nodesQuery.map(node => ({
            id: node.id,
            lat: node.lat,
            lng: node.lng
        }))

        return NextResponse.json({
            route: routeData,
            nodes: nodes
        });
    } catch(error) {
        console.error("Routing API Error:", error);
        return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 });
    }
}