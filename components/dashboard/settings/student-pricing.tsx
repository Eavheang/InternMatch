"use client";

import { PricingCard } from "./pricing-card";

interface StudentPricingProps {
    currentPlan?: string;
}

export function StudentPricing({ currentPlan = "free" }: StudentPricingProps) {

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
                <h2 className="text-xl font-semibold text-zinc-900">Student Plans</h2>
                <p className="text-zinc-500">Choose the plan that best fits your career goals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PricingCard
                    title="Free"
                    price="Free"
                    description="Essential tools to get started"
                    features={[
                        "Role suggestion: 1 month",
                        "Interview preps: 5 times/month",
                        "ATS Analyze: 1 month",
                        "Resume: 1/month",
                    ]}
                    onSubscribe={() => { }}
                    isCurrentPlan={currentPlan === "free"}
                />
                <PricingCard
                    title="Basic"
                    price="$5"
                    description="More power for active job seekers"
                    features={[
                        "Role suggestion: 3 times/month",
                        "Interview preps: 15 times/month",
                        "ATS Analyze: 5 months",
                        "Resume: 5/month",
                    ]}
                    onSubscribe={() => handleSubscribe(5, "basic")}
                    isCurrentPlan={currentPlan === "basic"}
                />
                <PricingCard
                    title="Pro"
                    price="$15"
                    description="Maximum potential for serious candidates"
                    features={[
                        "Role suggestion: 5 times/month",
                        "Interview preps: 45 times/month",
                        "ATS Analyze: 15 months",
                        "Resume: 15/month",
                    ]}
                    onSubscribe={() => handleSubscribe(15, "pro")}
                    isCurrentPlan={currentPlan === "pro"}
                />
            </div>
        </div>
    );
}
