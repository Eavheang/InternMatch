"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TestPaymentPage() {
    const [amount, setAmount] = useState("1000");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/payway/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Payment error:", error);
                alert("Payment failed: " + (error.message || error.error));
                return;
            }

            // Check content type to decide how to handle response
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.url) {
                    // Redirect to the PayWay checkout URL
                    window.location.href = data.url;
                } else {
                    console.error("Unexpected JSON response:", data);
                    alert("Received unexpected response from server.");
                }
            } else {
                // Fallback for direct HTML content (if any)
                const html = await res.text();
                const newWindow = window.open("", "_blank");
                if (newWindow) {
                    newWindow.document.write(html);
                    newWindow.document.close();
                } else {
                    alert("Please allow popups to proceed with payment.");
                }
            }

        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred while initiating payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Test ABA PayWay</CardTitle>
                    <CardDescription>Enter an amount to test the integration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Input
                                id="amount"
                                placeholder="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button onClick={handlePayment} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay with ABA PayWay
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
