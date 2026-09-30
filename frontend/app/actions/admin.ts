"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function generateFHIR(nodeId: string, verificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== "ADMIN") return { success: false, message: "Forbidden" };

    const verification = await prisma.verification.findUnique({
        where: { id: verificationId },
        include: { node: true, user: true }
    });

    if (!verification) return { success: false, message: "Record not found" };

    const fhirObservation = {
        resourceType: "Observation",
        id: `obs-${verification.id}`,
        status: "final",
        category: [{
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "environment", display: "Environment" }]
        }],
        code: {
            coding: [{ system: "http://snomed.info/sct", code: "407481005", display: "Stagnant Water Vector Risk" }]
        },
        subject: {
            display: `Geographic Coordinate: ${verification.node.lat}, ${verification.node.lng}`
        },
        effectiveDateTime: new Date().toISOString(),
        valueString: `Water: ${verification.waterStatus} | Mosquitoes: ${verification.mosquitoPresence}`,
        note: [{ text: `AI Flag: ${verification.aiStatus}. Verified by citizen ${verification.user.email}.` }]
    };

    await prisma.$transaction(async (tx) => {
        await tx.node.update({
            where: { id: nodeId },
            data: { status: "RESOLVED" }
        });

        await tx.fHIRReport.create({
            data: {
                verificationId: verification.id,
                payload: fhirObservation
            }
        });
    });

    console.dir(fhirObservation, { depth: null, colors: true });

    revalidatePath("/dashboard");
    return { success: true };
}