import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const result = await prisma.node.deleteMany({
            where: {
                status: "UNVERIFIED",
                createdAt: {
                    lt: twoDaysAgo
                },
                verifications: {
                    none: {}
                }
            }
        });
        return NextResponse.json({ 
            success: true, 
            message: `Cleared ${result.count} expired UNVERIFIED nodes.` 
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: "Failed to run cleanup" }, { status: 500 });
    }
}