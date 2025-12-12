import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
        const { tranId } = body;

        if (!tranId) {
            return NextResponse.json(
                { error: "Missing tran_id" },
                { status: 400 }
            );
        }

        // Find the transaction
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.tranId, tranId),
                    eq(transactions.userId, user.userId)
                )
            )
            .limit(1);

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        // Verify transaction belongs to user and is completed
        if (transaction.status !== "completed") {
            return NextResponse.json(
                { error: "Can only downgrade completed subscriptions" },
                { status: 400 }
            );
        }

        // Cancel auto-renewal and set expiration to now to immediately downgrade
        const now = new Date();
        const [updatedTransaction] = await db
            .update(transactions)
            .set({
                autoRenew: false,
                nextBillingDate: null,
                expiresAt: now, // Set expiration to now to immediately downgrade
                updatedAt: now,
            })
            .where(eq(transactions.tranId, tranId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Successfully downgraded to free plan",
            transaction: updatedTransaction,
        });

    } catch (error: any) {
        console.error("Error downgrading to free plan:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to downgrade to free plan",
            },
            { status: 500 }
        );
    }
}



