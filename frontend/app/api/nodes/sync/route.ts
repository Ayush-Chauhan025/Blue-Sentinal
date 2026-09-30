import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nodes } = body;

        if (!nodes || !Array.isArray(nodes)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodesToInsert = nodes.map((node: any) => ({
            lat: node.latitude,
            lng: node.longitude,
        }));

        const result = await prisma.node.createMany({
            data: nodesToInsert,
            skipDuplicates: true,
        });

        return NextResponse.json({ 
            success: true, 
            message: `Inserted ${result.count} new Risk Nodes into the database.` 
        });

    } catch (error) {
        console.error("Database sync error:", error);
        return NextResponse.json({ error: "Failed to sync nodes" }, { status: 500 });
    }
}