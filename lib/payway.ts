import crypto from "crypto";

// The exact order of parameters for hashing as per PayWay documentation
const PAYWAY_KEYS = [
    "req_time",
    "merchant_id",
    "tran_id",
    "amount",
    "items",
    "shipping",
    "firstname",
    "lastname",
    "email",
    "phone",
    "type",
    "payment_option",
    "return_url",
    "cancel_url",
    "continue_success_url",
    "return_deeplink",
    "currency",
    "custom_fields",
    "return_params",
    "payout",
    "lifetime",
    "additional_params",
    "google_pay_token",
    "skip_success_page",
];

export function createPayWayHash(data: Record<string, any>, apiKey: string): string {
    let b4hash = "";

    PAYWAY_KEYS.forEach((key) => {
        if (key in data && data[key] !== undefined && data[key] !== null && data[key] !== "") {
            b4hash += data[key];
        }
    });

    return Buffer.from(
        crypto.createHmac("sha512", apiKey).update(b4hash).digest()
    ).toString("base64");
}

export interface PayWayCheckTransactionResponse {
    data?: PayWayTransactionData;
    status?: PayWayStatus | number;
    [property: string]: any;
}

export interface PayWayTransactionData {
    apv?: string;
    discount_amount?: number;
    original_amount?: number;
    payment_amount?: number;
    payment_currency?: string;
    payment_status?: string;
    payment_status_code?: number;
    refund_amount?: number;
    status?: PayWayStatus;
    total_amount?: number;
    transaction_date?: string;
    [property: string]: any;
}

export interface PayWayStatus {
    code?: string;
    message?: string;
    tran_id?: string;
    [property: string]: any;
}
