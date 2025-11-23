import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tran_id } = body;

        if (!tran_id) {
            return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
        }

        const merchant_id = process.env.PAYWAY_MERCHANT_ID;
        const api_key = process.env.PAYWAY_API_KEY;

        if (!merchant_id || !api_key) {
            return NextResponse.json(
                { error: "Missing configuration" },
                { status: 500 }
            );
        }

        const req_time = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

        // Hash for check transaction:
        // req_time + merchant_id + tran_id
        const b4hash = req_time + merchant_id + tran_id;
        const hash = Buffer.from(
            crypto.createHmac("sha512", api_key).update(b4hash).digest()
        ).toString("base64");

        const payload = {
            req_time,
            merchant_id,
            tran_id,
            hash,
        };

        const formData = new FormData();
        formData.append("req_time", req_time);
        formData.append("merchant_id", merchant_id);
        formData.append("tran_id", tran_id);
        formData.append("hash", hash);

        const resABA = await fetch(
            "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction",
            {
                method: "POST",
                body: formData,
            }
        );
        console.log("Check Transaction Response:", resABA);

        const data = await resABA.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Check Transaction Error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        );
    }
}
