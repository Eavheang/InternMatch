import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PayWayCheckTransactionResponse, PayWayTransactionData } from "@/lib/payway";

export async function POST(req: NextRequest) {
    try {
        // PayWay sends data as FormData or JSON. Usually FormData for browser redirects.
        const contentType = req.headers.get("content-type") || "";
        let data: any = {};

        if (contentType.includes("application/json")) {
            data = await req.json();
        } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            data = Object.fromEntries(formData.entries());
        }

        console.log("PayWay Return Data:", JSON.stringify(data, null, 2));

        const tran_id = data.tran_id as string;
        if (!tran_id) {
            console.error("No tran_id in PayWay return data");
            return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
        }

        let paymentStatus = "failed";
        let paymentStatusCode: number | undefined;
        let paymentStatusMessage: string | undefined;
        let paymentAmount: number | undefined;
        let paymentCurrency: string | undefined;
        let transactionDate: Date | undefined;
        let transactionMetadata: any = null;

        // Default to the status sent by PayWay, but we will verify it
        let status = data.status;

        // First, check if transaction exists in database
        const [existingTransaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.tranId, tran_id))
            .limit(1);

        if (!existingTransaction) {
            console.error(`Transaction not found in database: ${tran_id}`);
            // Still try to verify with PayWay, but log the issue
        } else {
            console.log(`Found transaction in database: ${tran_id}, current status: ${existingTransaction.status}`);
        }

        try {
            // Verify with check-transaction
            const merchant_id = process.env.PAYWAY_MERCHANT_ID;
            const api_key = process.env.PAYWAY_API_KEY;

            if (!merchant_id || !api_key) {
                console.error("Missing PayWay configuration");
                throw new Error("Missing PayWay configuration");
            }

            const req_time = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
            const b4hash = req_time + merchant_id + tran_id;
            const hash = Buffer.from(
                crypto.createHmac("sha512", api_key).update(b4hash).digest()
            ).toString("base64");

            const formData = new FormData();
            formData.append("req_time", req_time);
            formData.append("merchant_id", merchant_id);
            formData.append("tran_id", tran_id);
            formData.append("hash", hash);

            const checkRes = await fetch("https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction", {
                method: "POST",
                body: formData
            });

            if (!checkRes.ok) {
                const errorText = await checkRes.text();
                console.error("PayWay check-transaction failed:", errorText);
                throw new Error(`PayWay API error: ${checkRes.status}`);
            }

            const checkData: PayWayCheckTransactionResponse = await checkRes.json();
            console.log("Check Transaction Result:", JSON.stringify(checkData, null, 2));

            transactionMetadata = checkData;

            // Determine payment status from response - matching the logic from test-payment/return/page.tsx
            if (checkData.status === 0) {
                // Direct status 0 means success
                paymentStatus = "completed";
                paymentStatusCode = 0;
                console.log("Payment status: completed (status === 0)");
            } else if (typeof checkData.status === 'object' && checkData.status?.code === "00") {
                // Status object with code "00" means success
                paymentStatus = "completed";
                paymentStatusCode = 0;
                console.log("Payment status: completed (status.code === '00')");
            } else if (checkData.data) {
                // Check data object for payment status
                const transactionData: PayWayTransactionData = checkData.data;
                paymentStatusCode = transactionData.payment_status_code;
                paymentStatusMessage = transactionData.payment_status;
                paymentAmount = transactionData.payment_amount;
                paymentCurrency = transactionData.payment_currency;
                
                if (transactionData.transaction_date) {
                    transactionDate = new Date(transactionData.transaction_date);
                }

                // Map PayWay status codes to our status
                // Status code 0 means success
                if (paymentStatusCode === 0 || (paymentStatusCode === undefined && transactionData.payment_status === "success")) {
                    paymentStatus = "completed";
                    console.log("Payment status: completed (payment_status_code === 0)");
                } else if (transactionData.payment_status === "success" || transactionData.payment_status === "completed") {
                    paymentStatus = "completed";
                    console.log("Payment status: completed (payment_status === 'success')");
                } else {
                    paymentStatus = "failed";
                    console.log(`Payment status: failed (payment_status_code: ${paymentStatusCode}, payment_status: ${transactionData.payment_status})`);
                }
            } else {
                // If we can't determine status, check the initial status from return data
                if (data.status === "0" || data.status === 0) {
                    paymentStatus = "completed";
                    console.log("Payment status: completed (fallback to return data status)");
                } else {
                    paymentStatus = "failed";
                    console.log(`Payment status: failed (unable to determine from response)`);
                }
            }

            status = checkData.status;
        } catch (checkError) {
            console.error("Failed to verify transaction:", checkError);
            // Fallback to the status we received initially from PayWay return
            if (data.status === "0" || data.status === 0) {
                paymentStatus = "completed";
                console.log("Payment status: completed (fallback from error)");
            } else {
                paymentStatus = "failed";
            }
        }

        // Update transaction in database
        console.log(`Updating transaction ${tran_id} to status: ${paymentStatus}`);
        try {
            const updateResult = await db
                .update(transactions)
                .set({
                    status: paymentStatus as "pending" | "completed" | "failed" | "cancelled" | "refunded",
                    paymentStatus: paymentStatusMessage,
                    paymentStatusMessage: paymentStatusMessage,
                    paymentAmount: paymentAmount,
                    paymentCurrency: paymentCurrency,
                    transactionDate: transactionDate,
                    metadata: transactionMetadata,
                    updatedAt: new Date(),
                })
                .where(eq(transactions.tranId, tran_id))
                .returning();

            if (updateResult.length === 0) {
                console.error(`Failed to update transaction: No rows affected for tran_id: ${tran_id}`);
            } else {
                console.log(`Successfully updated transaction ${tran_id}:`, updateResult[0]);
            }
        } catch (dbError) {
            console.error("Failed to update transaction in database:", dbError);
            // Log the full error details
            if (dbError instanceof Error) {
                console.error("Database error message:", dbError.message);
                console.error("Database error stack:", dbError.stack);
            }
            // Don't throw - we still want to redirect the user
        }

        // Determine redirect URL based on payment status
        // If payment is successful, redirect to success URL, otherwise to cancel URL
        const host = process.env.HOST || "http://localhost:3000";
        let redirectUrl: string;
        
        if (paymentStatus === "completed") {
            redirectUrl = `${host}/dashboard/settings?success=true&tran_id=${tran_id || ""}`;
        } else {
            redirectUrl = `${host}/dashboard/settings?canceled=true&tran_id=${tran_id || ""}`;
        }

        // 303 See Other is appropriate for redirecting after a POST
        return NextResponse.redirect(redirectUrl, 303);

    } catch (error) {
        console.error("Error in PayWay return handler:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Also handle GET just in case, though PayWay says POST
export async function GET(req: NextRequest) {
    const host = process.env.HOST || "http://localhost:3000";
    const url = new URL(`${host}/dashboard/settings`);
    return NextResponse.redirect(url);
}
