import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const user = getAuthenticatedUser(req);
        if (!user.userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Find the most recent completed transaction for this user
        const [latestTransaction] = await db
            .select()
            .from(transactions)
            .where(and(
                eq(transactions.userId, user.userId),
                eq(transactions.status, "completed")
            ))
            .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
            .limit(1);

        console.log("[Plan API] Latest completed transaction:", {
            tranId: latestTransaction?.tranId,
            plan: latestTransaction?.plan,
            amount: latestTransaction?.amount,
            status: latestTransaction?.status,
            expiresAt: latestTransaction?.expiresAt,
        });

        // Check if subscription has expired
        let plan = "free";
        let isExpired = false;
        let isActive = false;
        
        if (latestTransaction?.plan && latestTransaction.plan.trim() !== "") {
            // Check expiration
            if (latestTransaction.expiresAt) {
                const now = new Date();
                const expirationDate = new Date(latestTransaction.expiresAt);
                isExpired = now > expirationDate;
                isActive = !isExpired;
                
                if (isExpired) {
                    // Subscription expired - check if auto-renewal is enabled
                    if (latestTransaction.autoRenew) {
                        // Auto-renewal is enabled, but payment hasn't been processed yet
                        // Keep showing the plan but mark as expired/pending renewal
                        plan = latestTransaction.plan;
                    } else {
                        // Auto-renewal disabled, revert to free plan
                        plan = "free";
                    }
                } else {
                    // Subscription is still active
                    plan = latestTransaction.plan;
                }
            } else {
                // No expiration date set (legacy transaction) - treat as active
                plan = latestTransaction.plan;
                isActive = true;
            }
        }

        console.log("[Plan API] Returning plan:", plan, "isExpired:", isExpired, "isActive:", isActive);

        return NextResponse.json({
            plan,
            transaction: latestTransaction || null,
            isExpired,
            isActive,
            expiresAt: latestTransaction?.expiresAt || null,
            nextBillingDate: latestTransaction?.nextBillingDate || null,
            autoRenew: latestTransaction?.autoRenew || false,
        });

    } catch (error: any) {
        console.error("Error fetching user plan:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to fetch plan",
            },
            { status: 500 }
        );
    }
}

