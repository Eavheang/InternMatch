import { NextRequest, NextResponse } from "next/server";
import { createPayWayHash } from "@/lib/payway";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { db } from "@/db";
import { transactions, students, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  let tran_id: string | null = null;
  
  try {
    // Get authenticated user
    const user = getAuthenticatedUser(req);
    if (!user.userId || !user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      amount = 1, 
      plan,
      continue_success_url: customSuccessUrl,
      cancel_url: customCancelUrl 
    } = body;

    const merchant_id = process.env.PAYWAY_MERCHANT_ID;
    const api_key = process.env.PAYWAY_API_KEY;

    if (!merchant_id || !api_key) {
      return NextResponse.json(
        { error: "Missing PAYWAY_MERCHANT_ID or PAYWAY_API_KEY environment variables" },
        { status: 500 }
      );
    }

    const req_time = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

    // Use a purely numeric transaction ID to avoid potential format issues
    // Format: YYYYMMDDHHmmss + 3 random digits
    tran_id = req_time + Math.floor(Math.random() * 1000).toString().padStart(3, "0");

    // Get user profile data for name and phone
    let firstName = "User";
    let lastName = "";
    let phone = "012345678"; // Default phone

    if (user.role === "student") {
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.userId, user.userId))
        .limit(1);
      
      if (student) {
        firstName = student.firstName || firstName;
        lastName = student.lastName || "";
        phone = student.phoneNumber || phone;
      }
    } else if (user.role === "company") {
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, user.userId))
        .limit(1);
      
      if (company) {
        firstName = company.contactName?.split(" ")[0] || company.companyName || firstName;
        lastName = company.contactName?.split(" ").slice(1).join(" ") || "";
        phone = company.contactPhone || phone;
      }
    }

    // Calculate expiration date (1 month from now) for subscription plans
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Add 1 month
    const nextBillingDate = new Date(expiresAt); // Next billing is when current subscription expires

    // Create transaction record in database
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: user.userId,
        tranId: tran_id,
        amount: amount,
        currency: "USD",
        plan: plan || null,
        status: "pending",
        expiresAt: plan ? expiresAt : null, // Only set expiration for paid plans
        autoRenew: plan ? true : false, // Auto-renew enabled for paid plans
        nextBillingDate: plan ? nextBillingDate : null,
      })
      .returning();

    // Determine product name based on plan
    const productName = plan 
      ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`
      : "Subscription Payment";

    const items = Buffer.from(
      JSON.stringify([{ name: productName, quantity: 1, price: amount }])
    ).toString("base64");

    const host = process.env.HOST || "http://localhost:3000";
    const return_url = `${host}/api/payway/return`;
    const cancel_url = customCancelUrl || `${host}/dashboard/settings?canceled=true`;
    
    // Always ensure tran_id is in the success URL, even if custom URL is provided
    let continue_success_url: string;
    if (customSuccessUrl) {
      // Append tran_id to custom URL if it doesn't already have it
      const url = new URL(customSuccessUrl);
      url.searchParams.set("tran_id", tran_id);
      continue_success_url = url.toString();
    } else {
      continue_success_url = `${host}/dashboard/settings?success=true&tran_id=${tran_id}`;
    }

    // Only include fields that have values. Empty strings for optional fields are removed.
    const payload: Record<string, any> = {
      req_time,
      merchant_id,
      tran_id,
      amount: amount.toString(),
      items,
      firstname: firstName,
      lastname: lastName,
      email: user.email,
      phone: phone,
      type: "purchase",
      payment_option: "cards",
      payment_gate: "0",
      view_type: "hosted_view",
      return_url,
      cancel_url,
      continue_success_url,
      currency: "USD",
    };

    // Remove undefined or empty string values
    Object.keys(payload).forEach(key => {
      if (payload[key] === "" || payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    const hash = createPayWayHash(payload, api_key);

    const requestBody = {
      ...payload,
      hash,
    };

    console.log("PayWay Request Body:", JSON.stringify(requestBody, null, 2));

    const formData = new FormData();
    Object.entries(requestBody).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const resABA = await fetch(
      "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("PayWay Response:", resABA);

    if (!resABA.ok) {
      const text = await resABA.text();
      console.error("PayWay Error Response:", text);
      
      // Update transaction status to failed
      if (tran_id) {
        try {
          await db
            .update(transactions)
            .set({ 
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(transactions.tranId, tran_id));
        } catch (dbError) {
          console.error("Failed to update transaction status:", dbError);
        }
      }
      
      return NextResponse.json({ error: "PayWay Error", details: text }, { status: resABA.status });
    }

    // If the response was redirected (which it seems to be for hosted_view),
    // return the final URL so the frontend can redirect the user.
    if (resABA.redirected) {
      return NextResponse.json({ url: resABA.url });
    }

    // Fallback: If not redirected, maybe it returned HTML directly?
    const html = await resABA.text();
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error: any) {
    console.error("PayWay API error:", error);
    
    // If transaction was created, update it to failed status
    if (tran_id) {
      try {
        await db
          .update(transactions)
          .set({ 
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(transactions.tranId, tran_id));
      } catch (dbError) {
        console.error("Failed to update transaction status:", dbError);
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process payment request",
      },
      { status: 500 }
    );
  }
}
