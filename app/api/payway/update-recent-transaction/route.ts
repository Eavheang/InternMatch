import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const user = getAuthenticatedUser(req);
        if (!user.userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Missing status" },
                { status: 400 }
            );
        }

        // Find the most recent pending transaction for this user
        const [pendingTransaction] = await db
            .select()
            .from(transactions)
            .where(and(
                eq(transactions.userId, user.userId),
                eq(transactions.status, "pending")
            ))
            .orderBy(desc(transactions.createdAt))
            .limit(1);

        if (!pendingTransaction) {
            return NextResponse.json(
                { error: "No pending transaction found" },
                { status: 404 }
            );
        }

        // Calculate expiration date for completed subscriptions (1 month from now)
        let expiresAt: Date | undefined = undefined;
        let nextBillingDate: Date | undefined = undefined;
        
        if (status === "completed" && pendingTransaction.plan) {
            const now = new Date();
            expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            nextBillingDate = new Date(expiresAt);
        }

        // Update the transaction status
        const updateData: any = {
            status: status as "pending" | "completed" | "failed" | "cancelled" | "refunded",
            updatedAt: new Date(),
        };
        
        // Set expiration dates if payment is completed and plan exists
        if (status === "completed" && pendingTransaction.plan && expiresAt) {
            updateData.expiresAt = expiresAt;
            updateData.nextBillingDate = nextBillingDate;
            updateData.autoRenew = pendingTransaction.autoRenew !== false; // Default to true if not set
        }
        
        const [updatedTransaction] = await db
            .update(transactions)
            .set(updateData)
            .where(eq(transactions.id, pendingTransaction.id))
            .returning();

        return NextResponse.json({
            success: true,
            tran_id: updatedTransaction.tranId,
            transaction: updatedTransaction,
        });

    } catch (error: any) {
        console.error("Error updating recent transaction:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to update transaction",
            },
            { status: 500 }
        );
    }
}

