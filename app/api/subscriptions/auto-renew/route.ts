import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, lte, sql, isNotNull, ne } from "drizzle-orm";
import { students, companies } from "@/db/schema";

/**
 * Auto-renewal endpoint - processes monthly subscription renewals
 * This should be called by a cron job or scheduled task daily
 * 
 * Security: Should be protected with a secret token or API key
 */
export async function POST(req: NextRequest) {
    try {
        // Optional: Add authentication/authorization here
        // For example, check for a secret token in headers
        const authHeader = req.headers.get("authorization");
        const expectedToken = process.env.AUTO_RENEW_SECRET_TOKEN;
        
        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const now = new Date();
        // Find all subscriptions that:
        // 1. Are completed
        // 2. Have auto-renew enabled
        // 3. Have expired or are expiring today
        // 4. Have a plan set
        const expiredSubscriptions = await db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.status, "completed"),
                    eq(transactions.autoRenew, true),
                    lte(transactions.expiresAt, now),
                    isNotNull(transactions.plan),
                    ne(transactions.plan, "")
                )
            );

        console.log(`[Auto-Renew] Found ${expiredSubscriptions.length} subscriptions to renew`);

        const renewalResults = [];

        for (const subscription of expiredSubscriptions) {
            try {
                // Get user details for payment
                const [student] = await db
                    .select()
                    .from(students)
                    .where(eq(students.userId, subscription.userId))
                    .limit(1);

                const [company] = await db
                    .select()
                    .from(companies)
                    .where(eq(companies.userId, subscription.userId))
                    .limit(1);

                // Get user email from users table (we'll need to import it)
                // For now, we'll use the transaction metadata or create a new transaction
                
                // Create new transaction for renewal
                const req_time = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
                const new_tran_id = req_time + Math.floor(Math.random() * 1000).toString().padStart(3, "0");

                // Calculate new expiration date (1 month from now)
                const newExpiresAt = new Date(now);
                newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
                const newNextBillingDate = new Date(newExpiresAt);

                // Create renewal transaction record
                const [renewalTransaction] = await db
                    .insert(transactions)
                    .values({
                        userId: subscription.userId,
                        tranId: new_tran_id,
                        amount: subscription.amount,
                        currency: subscription.currency,
                        plan: subscription.plan,
                        status: "pending",
                        expiresAt: newExpiresAt,
                        autoRenew: true,
                        nextBillingDate: newNextBillingDate,
                    })
                    .returning();

                // Note: In a real implementation, you would:
                // 1. Call PayWay API to charge the user's saved payment method
                // 2. Update the transaction status based on payment result
                // 3. Handle payment failures (retry logic, notify user, etc.)
                
                // For now, we'll mark it as pending and log that manual processing is needed
                console.log(`[Auto-Renew] Created renewal transaction ${new_tran_id} for user ${subscription.userId}, plan ${subscription.plan}`);

                renewalResults.push({
                    userId: subscription.userId,
                    oldTranId: subscription.tranId,
                    newTranId: new_tran_id,
                    plan: subscription.plan,
                    amount: subscription.amount,
                    status: "pending_manual_payment", // Requires manual payment processing
                });

            } catch (error: any) {
                console.error(`[Auto-Renew] Error processing renewal for transaction ${subscription.tranId}:`, error);
                renewalResults.push({
                    userId: subscription.userId,
                    oldTranId: subscription.tranId,
                    plan: subscription.plan,
                    error: error.message,
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: renewalResults.length,
            renewals: renewalResults,
            message: "Auto-renewal processing completed. Some renewals may require manual payment processing.",
        });

    } catch (error: any) {
        console.error("Error in auto-renewal:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to process auto-renewals",
            },
            { status: 500 }
        );
    }
}

