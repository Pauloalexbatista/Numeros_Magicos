'use server'
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function upgradeToPro() {
    const session = await auth();
    if (!session?.user?.email) return { success: false, message: "Not authenticated" };

    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Add 30 days

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                role: "PRO",
                subscriptionExpiresAt: expiresAt
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to upgrade:", error);
        return { success: false, message: "Database error" };
    }
}
