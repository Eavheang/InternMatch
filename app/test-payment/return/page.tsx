import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PayWayCheckTransactionResponse } from "@/lib/payway";

export default async function ReturnPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    console.log("Return Page Params:", params);
    const { tran_id } = params;

    let status = "Unknown";
    let verified = false;
    let fullResponse: PayWayCheckTransactionResponse | null = null;

    if (tran_id) {
        try {
            const host = process.env.HOST || "http://localhost:3000";
            const res = await fetch(`${host}/api/payway/check-transaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tran_id }),
                cache: "no-store",
            });

            if (res.ok) {
                fullResponse = await res.json();

                // Handle different response structures
                if (fullResponse?.status === 0) {
                    status = "0"; // Success
                    verified = true;
                } else if (typeof fullResponse?.status === 'object' && fullResponse?.status?.code === "00") {
                    status = "0"; // Success
                    verified = true;
                } else if (fullResponse?.data?.payment_status_code !== undefined) {
                    status = fullResponse.data.payment_status_code.toString();
                    verified = true;
                }
            } else {
                console.error("Failed to check transaction:", await res.text());
            }
        } catch (error) {
            console.error("Error checking transaction:", error);
        }
    }

    return (
        <div className="container mx-auto py-10 flex flex-col items-center gap-6">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {status === "0" ? (
                        <div className="text-green-600 font-bold text-center">Payment Successful!</div>
                    ) : (
                        <div className="text-red-600 font-bold text-center">
                            Payment Failed or Cancelled
                        </div>
                    )}

                    <div className="text-sm text-gray-500">
                        Transaction Status Code: {status}
                        {verified && <span className="ml-2 text-xs text-green-500">(Verified)</span>}
                    </div>

                    {tran_id && (
                        <div className="text-xs text-gray-400">
                            Transaction ID: {tran_id}
                        </div>
                    )}

                    <Link href="/test-payment" className="w-full">
                        <Button className="w-full">Try Again</Button>
                    </Link>
                </CardContent>
            </Card>

            {fullResponse && (
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                            {JSON.stringify(fullResponse, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
