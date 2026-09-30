"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitVerification(nodeId: string, waterStatus: string, mosquitoPresence: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    try {
        await prisma.verification.create({
            data: {
                nodeId,
                userId: user.id,
                aiStatus: "Verified via Gemini Vision",
                waterStatus,
                mosquitoPresence
            }
        });

        await prisma.node.update({
            where: { id: nodeId },
            data: { status: "PENDING_ADMIN_REVIEW" }
        });

        revalidatePath("/maps");
        return { success: true, message: "Report submitted" };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, message: "Database error occurred." };
    }
}