"use client";

import { PricingCard } from "./pricing-card";

interface CompanyPricingProps {
    currentPlan?: string;
}

export function CompanyPricing({ currentPlan = "free" }: CompanyPricingProps) {

    const handleSubscribe = async (amount: number, plan: string) => {
        try {
            const token = localStorage.getItem("internmatch_token");
            const response = await fetch("/api/payway/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount,
                    plan,
                    continue_success_url: `${window.location.origin}/dashboard/settings?success=true`,
                    cancel_url: `${window.location.origin}/dashboard/settings?canceled=true`,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Failed to get payment URL");
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900">Company Plans</h2>
                <p className="text-zinc-500">Scale your recruitment with our flexible plans.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PricingCard
                    title="Free"
                    price="Free"
                    description="Basic tools for small teams"
                    features={[
                        "Generate job prediction: 5 times/month",
                        "Alternative role: 5 times",
                        "Interview questions: 5 to prepare",
                    ]}
                    onSubscribe={() => { }}
                    isCurrentPlan={currentPlan === "free"}
                />
                <PricingCard
                    title="Growth"
                    price="$15"
                    description="Enhanced tools for growing companies"
                    features={[
                        "Generate job prediction: 10 times/month",
                        "Alternative role: 10 times",
                        "Interview questions: 10 to prepare",
                    ]}
                    onSubscribe={() => handleSubscribe(15, "growth")}
                    isCurrentPlan={currentPlan === "growth"}
                />
                <PricingCard
                    title="Enterprise"
                    price="$25"
                    description="Full access for large organizations"
                    features={[
                        "Generate job prediction: 20 times/month",
                        "Alternative role: 20 times",
                        "Interview questions: 20 to prepare",
                    ]}
                    onSubscribe={() => handleSubscribe(25, "enterprise")}
                    isCurrentPlan={currentPlan === "enterprise"}
                />
            </div>
        </div>
    );
}
