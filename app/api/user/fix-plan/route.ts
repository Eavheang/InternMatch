import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, desc, isNull, or, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

/**
 * This endpoint fixes transactions that have status="completed" but plan is null
 * It infers the plan from the amount:
 * - $5 = "basic" (students) or "growth" (companies)
 * - $15 = "pro" (students) or "growth" (companies) 
 * - $25 = "enterprise" (companies)
 */
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

        // Find completed transactions with null or empty plan
        const completedTransactionsWithoutPlan = await db
            .select()
            .from(transactions)
            .where(and(
                eq(transactions.userId, user.userId),
                eq(transactions.status, "completed"),
                or(
                    isNull(transactions.plan),
                    sql`${transactions.plan} = ''`
                )
            ))
            .orderBy(desc(transactions.createdAt));

        if (completedTransactionsWithoutPlan.length === 0) {
            return NextResponse.json({
                message: "No transactions need fixing",
                fixed: 0,
            });
        }

        const fixedTransactions = [];

        for (const transaction of completedTransactionsWithoutPlan) {
            let inferredPlan: string | null = null;

            // Infer plan from amount and user role
            if (user.role === "student") {
                if (transaction.amount === 5) {
                    inferredPlan = "basic";
                } else if (transaction.amount === 15) {
                    inferredPlan = "pro";
                }
            } else if (user.role === "company") {
                if (transaction.amount === 15) {
                    inferredPlan = "growth";
                } else if (transaction.amount === 25) {
                    inferredPlan = "enterprise";
                }
            }

            if (inferredPlan) {
                const [updated] = await db
                    .update(transactions)
                    .set({
                        plan: inferredPlan,
                        updatedAt: new Date(),
                    })
                    .where(eq(transactions.id, transaction.id))
                    .returning();

                fixedTransactions.push({
                    tranId: updated.tranId,
                    amount: updated.amount,
                    plan: updated.plan,
                });
            }
        }

        return NextResponse.json({
            message: `Fixed ${fixedTransactions.length} transaction(s)`,
            fixed: fixedTransactions.length,
            transactions: fixedTransactions,
        });

    } catch (error: any) {
        console.error("Error fixing plan:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to fix plan",
            },
            { status: 500 }
        );
    }
}

