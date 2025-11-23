import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { PayWayCheckTransactionResponse, PayWayTransactionData } from "@/lib/payway";

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
        const { tran_id, status, check_data } = body;

        if (!tran_id) {
            return NextResponse.json(
                { error: "Missing tran_id" },
                { status: 400 }
            );
        }

        // Find the transaction
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.tranId, tran_id))
            .limit(1);

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        // Verify the transaction belongs to the user
        if (transaction.userId !== user.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Extract payment details from check_data if provided
        let paymentStatus = status || transaction.status;
        let paymentStatusCode: number | undefined;
        let paymentStatusMessage: string | undefined;
        let paymentAmount: number | undefined;
        let paymentCurrency: string | undefined;
        let transactionDate: Date | undefined;
        let transactionMetadata: any = check_data || transaction.metadata;
        
        // Calculate expiration date for completed subscriptions (1 month from payment date)
        let expiresAt: Date | undefined = transaction.expiresAt || undefined;
        let nextBillingDate: Date | undefined = transaction.nextBillingDate || undefined;
        
        if (paymentStatus === "completed" && transaction.plan && !expiresAt) {
            const paymentDate = transactionDate || new Date();
            expiresAt = new Date(paymentDate);
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            nextBillingDate = new Date(expiresAt);
        }

        if (check_data) {
            const checkData: PayWayCheckTransactionResponse = check_data;
            
            // Determine payment status from response
            if (checkData.status === 0) {
                paymentStatus = "completed";
                paymentStatusCode = 0;
            } else if (typeof checkData.status === 'object' && checkData.status?.code === "00") {
                paymentStatus = "completed";
                paymentStatusCode = 0;
            } else if (checkData.data) {
                const transactionData: PayWayTransactionData = checkData.data;
                paymentStatusCode = transactionData.payment_status_code;
                paymentStatusMessage = transactionData.payment_status;
                paymentAmount = transactionData.payment_amount;
                paymentCurrency = transactionData.payment_currency;
                
                if (transactionData.transaction_date) {
                    transactionDate = new Date(transactionData.transaction_date);
                }

                // Map PayWay status codes to our status
                if (paymentStatusCode === 0 || 
                    transactionData.payment_status === "success" || 
                    transactionData.payment_status === "completed") {
                    paymentStatus = "completed";
                } else {
                    paymentStatus = "failed";
                }
            }
        }

        // Update transaction in database
        const updateData: any = {
            status: paymentStatus as "pending" | "completed" | "failed" | "cancelled" | "refunded",
            paymentStatus: paymentStatusMessage,
            paymentStatusMessage: paymentStatusMessage,
            paymentAmount: paymentAmount,
            paymentCurrency: paymentCurrency,
            transactionDate: transactionDate,
            metadata: transactionMetadata,
            updatedAt: new Date(),
        };
        
        // Set expiration dates if payment is completed and plan exists
        if (paymentStatus === "completed" && transaction.plan && expiresAt) {
            updateData.expiresAt = expiresAt;
            updateData.nextBillingDate = nextBillingDate;
            updateData.autoRenew = transaction.autoRenew !== false; // Default to true if not set
        }
        
        const [updatedTransaction] = await db
            .update(transactions)
            .set(updateData)
            .where(eq(transactions.tranId, tran_id))
            .returning();

        return NextResponse.json({
            success: true,
            transaction: updatedTransaction,
        });

    } catch (error: any) {
        console.error("Error updating transaction:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error.message || "Failed to update transaction",
            },
            { status: 500 }
        );
    }
}

