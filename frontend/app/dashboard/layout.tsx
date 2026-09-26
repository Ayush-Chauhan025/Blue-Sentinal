import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    });

    if (dbUser?.role !== "ADMIN") {
        redirect("/maps");
    }

    return (
        <section className="admin-wrapper">
            {children}
        </section>
    );
}