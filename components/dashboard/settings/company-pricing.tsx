"use client";

import { useState } from "react";
import { PricingCard } from "./pricing-card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyPricingProps {
    currentPlan?: string;
}

export function CompanyPricing({ currentPlan = "free" }: CompanyPricingProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [isDowngrading, setIsDowngrading] = useState(false);

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

    const handleDowngradeToFree = () => {
        if (currentPlan === "free") {
            return; // Already on free plan
        }
        setShowDialog(true);
    };

    const confirmDowngrade = async () => {
        setIsDowngrading(true);
        try {
            const token = localStorage.getItem("internmatch_token");
            
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            // First, get the current plan to find the active transaction
            const planResponse = await fetch("/api/user/plan", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!planResponse.ok) {
                const errorData = await planResponse.json();
                throw new Error(errorData.error || "Failed to fetch current plan");
            }

            const planData = await planResponse.json();
            
            if (!planData.transaction || planData.transaction.status !== "completed") {
                // No active subscription to cancel
                alert("You are already on the free plan");
                setShowDialog(false);
                setIsDowngrading(false);
                return;
            }

            // Cancel auto-renewal and expire the subscription immediately
            const cancelResponse = await fetch("/api/subscriptions/cancel-auto-renew", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tranId: planData.transaction.tranId,
                }),
            });

            if (!cancelResponse.ok) {
                const errorData = await cancelResponse.json();
                throw new Error(errorData.error || "Failed to cancel subscription");
            }

            // Set expiration to now to immediately downgrade
            const expireResponse = await fetch("/api/subscriptions/downgrade-to-free", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tranId: planData.transaction.tranId,
                }),
            });

            if (expireResponse.ok) {
                alert("Successfully downgraded to free plan");
                window.location.reload();
            } else {
                const errorData = await expireResponse.json();
                throw new Error(errorData.error || "Failed to downgrade");
            }
        } catch (error) {
            console.error("Downgrade error:", error);
            alert(error instanceof Error ? error.message : "Failed to downgrade to free plan. Please try again.");
            setIsDowngrading(false);
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
                        "Alternative role: 5 times/month",
                        "Interview questions: 5 times/month",
                    ]}
                    onSubscribe={handleDowngradeToFree}
                    isCurrentPlan={currentPlan === "free"}
                    buttonText={currentPlan === "free" ? "Active Plan" : "Switch to Free"}
                />
                <PricingCard
                    title="Growth"
                    price="$15"
                    description="Enhanced tools for growing companies"
                    features={[
                        "Generate job prediction: 10 times/month",
                        "Alternative role: 10 times/month",
                        "Interview questions: 10 times/month",
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
                        "Alternative role: 20 times/month",
                        "Interview questions: 20 times/month",
                    ]}
                    onSubscribe={() => handleSubscribe(25, "enterprise")}
                    isCurrentPlan={currentPlan === "enterprise"}
                />
            </div>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Switch to Free Plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to downgrade to the free plan? Your current subscription will be cancelled immediately and you'll lose access to premium features.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDowngrading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDowngrade}
                            disabled={isDowngrading}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {isDowngrading ? "Downgrading..." : "Yes, Switch to Free"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
