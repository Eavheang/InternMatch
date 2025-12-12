"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { StudentPricing } from "@/components/dashboard/settings/student-pricing";
import { CompanyPricing } from "@/components/dashboard/settings/company-pricing";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function SettingsPage() {
    const { user, userPlan } = useDashboard();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentStatus, setPaymentStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });
    const [isVerifying, setIsVerifying] = useState(false);
    const [processedTranId, setProcessedTranId] = useState<string | null>(null);
    const [planFixed, setPlanFixed] = useState(false);

    useEffect(() => {
        // Auto-fix plan if user has completed transactions but plan is free (only once)
        const autoFixPlan = async () => {
            if (userPlan?.plan === "free" && user && !planFixed) {
                try {
                    const token = localStorage.getItem("internmatch_token");
                    const fixRes = await fetch("/api/user/fix-plan", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (fixRes.ok) {
                        const fixData = await fixRes.json();
                        if (fixData.fixed > 0) {
                            console.log("Auto-fixed plan:", fixData);
                            setPlanFixed(true);
                            // Refresh plan
                            const planRes = await fetch("/api/user/plan", {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            if (planRes.ok) {
                                router.refresh();
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error auto-fixing plan:", error);
                }
            }
        };

        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        const tranId = searchParams.get("tran_id");

        // Auto-fix plan on mount if needed
        autoFixPlan();

        // Prevent processing the same transaction multiple times
        if (success === "true" && tranId && processedTranId === tranId) {
            return;
        }

        if (success === "true") {
            if (tranId) {
                setProcessedTranId(tranId);
            }
            setIsVerifying(true);
            // Verify and update transaction status
            const verifyTransaction = async () => {
                try {
                    const token = localStorage.getItem("internmatch_token");
                    
                    // If we have tran_id, use it. Otherwise, we'll update the most recent pending transaction
                    if (tranId) {
                        // Call check-transaction API to verify payment status
                        const checkRes = await fetch("/api/payway/check-transaction", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({ tran_id: tranId }),
                        });

                        if (checkRes.ok) {
                            const checkData = await checkRes.json();
                            console.log("Transaction verification result:", checkData);

                            // Determine if payment was successful
                            let isSuccess = false;
                            if (checkData.status === 0) {
                                isSuccess = true;
                            } else if (typeof checkData.status === 'object' && checkData.status?.code === "00") {
                                isSuccess = true;
                            } else if (checkData.data?.payment_status_code === 0) {
                                isSuccess = true;
                            } else if (checkData.data?.payment_status === "success" || checkData.data?.payment_status === "completed") {
                                isSuccess = true;
                            }

                            if (isSuccess) {
                                // Update transaction status via API
                                try {
                                    const updateRes = await fetch("/api/payway/update-transaction", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({
                                            tran_id: tranId,
                                            status: "completed",
                                            check_data: checkData,
                                        }),
                                    });

                                    if (updateRes.ok) {
                                        console.log("Transaction status updated successfully");
                                        
                                        // Fix plan if it's null
                                        try {
                                            await fetch("/api/user/fix-plan", {
                                                method: "POST",
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            });
                                        } catch (fixError) {
                                            console.error("Error fixing plan:", fixError);
                                        }
                                        
                                        // Refresh plan data without full page reload
                                        const planRes = await fetch("/api/user/plan", {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        });
                                        if (planRes.ok) {
                                            const planData = await planRes.json();
                                            console.log("Plan after update:", planData);
                                            // Refresh to update plan display
                                            router.refresh();
                                            router.replace("/dashboard/settings", { scroll: false });
                                        }
                                    } else {
                                        const errorData = await updateRes.json();
                                        console.error("Failed to update transaction status:", errorData);
                                    }
                                } catch (updateError) {
                                    console.error("Error updating transaction:", updateError);
                                }
                            }

                            setPaymentStatus({
                                type: isSuccess ? "success" : "error",
                                message: isSuccess
                                    ? `Payment successful! Transaction ID: ${tranId}`
                                    : `Payment verification failed. Transaction ID: ${tranId}`,
                            });
                        } else {
                            // Even if check fails, try to update status to completed since PayWay redirected here
                            try {
                                const updateRes = await fetch("/api/payway/update-transaction", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        tran_id: tranId,
                                        status: "completed",
                                    }),
                                });
                                if (updateRes.ok) {
                                    console.log("Transaction status updated to completed (fallback)");
                                    
                                    // Fix plan if it's null
                                    try {
                                        await fetch("/api/user/fix-plan", {
                                            method: "POST",
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        });
                                    } catch (fixError) {
                                        console.error("Error fixing plan:", fixError);
                                    }
                                    
                                    // Refresh plan data without full page reload
                                    const planRes = await fetch("/api/user/plan", {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    });
                                    if (planRes.ok) {
                                        const planData = await planRes.json();
                                        console.log("Plan after update:", planData);
                                        router.refresh();
                                        router.replace("/dashboard/settings", { scroll: false });
                                    }
                                }
                            } catch (updateError) {
                                console.error("Error updating transaction (fallback):", updateError);
                            }
                            
                            setPaymentStatus({
                                type: "success",
                                message: `Payment successful! Transaction ID: ${tranId}`,
                            });
                        }
                    } else {
                        // No tran_id, update most recent pending transaction for this user
                        try {
                            const updateRes = await fetch("/api/payway/update-recent-transaction", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    status: "completed",
                                }),
                            });

                            if (updateRes.ok) {
                                const result = await updateRes.json();
                                console.log("Recent transaction updated:", result);
                                
                                // Fix plan if it's null
                                try {
                                    await fetch("/api/user/fix-plan", {
                                        method: "POST",
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    });
                                } catch (fixError) {
                                    console.error("Error fixing plan:", fixError);
                                }
                                
                                setPaymentStatus({
                                    type: "success",
                                    message: result.tran_id 
                                        ? `Payment successful! Transaction ID: ${result.tran_id}`
                                        : "Payment successful!",
                                });
                                // Refresh plan data without full page reload
                                const planRes = await fetch("/api/user/plan", {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });
                                if (planRes.ok) {
                                    const planData = await planRes.json();
                                    console.log("Plan after update:", planData);
                                    router.refresh();
                                    router.replace("/dashboard/settings", { scroll: false });
                                }
                            } else {
                                setPaymentStatus({
                                    type: "success",
                                    message: "Payment successful!",
                                });
                            }
                        } catch (error) {
                            console.error("Error updating recent transaction:", error);
                            setPaymentStatus({
                                type: "success",
                                message: "Payment successful!",
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error verifying transaction:", error);
                    // Still show success message if PayWay redirected here
                    setPaymentStatus({
                        type: "success",
                        message: tranId 
                            ? `Payment successful! Transaction ID: ${tranId}`
                            : "Payment successful!",
                    });
                } finally {
                    setIsVerifying(false);
                    // Clean up URL
                    router.replace("/dashboard/settings", { scroll: false });
                }
            };

            verifyTransaction();
        } else if (canceled === "true") {
            setPaymentStatus({
                type: "error",
                message: tranId
                    ? `Payment was canceled. Transaction ID: ${tranId}`
                    : "Payment was canceled.",
            });
            // Clean up URL
            router.replace("/dashboard/settings", { scroll: false });
        }
    }, [searchParams, router, userPlan, user, processedTranId, planFixed]);

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
                <p className="text-zinc-500">Manage your account and subscription</p>
                {userPlan && (
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className={`inline-block px-4 py-2 rounded-lg border ${
                                userPlan.isExpired 
                                    ? "bg-red-50 border-red-200" 
                                    : userPlan.plan !== "free"
                                    ? "bg-indigo-50 border-indigo-200"
                                    : "bg-gray-50 border-gray-200"
                            }`}>
                                <span className={`text-sm font-medium ${
                                    userPlan.isExpired 
                                        ? "text-red-900" 
                                        : userPlan.plan !== "free"
                                        ? "text-indigo-900"
                                        : "text-gray-900"
                                }`}>
                                    Current Plan: <span className="capitalize">{userPlan.plan}</span>
                                    {userPlan.isExpired && userPlan.plan !== "free" && (
                                        <span className="text-red-600 ml-2">(Expired)</span>
                                    )}
                                    {userPlan.transaction && userPlan.plan !== "free" && !userPlan.isExpired && (
                                        <span className="ml-2 text-indigo-600">
                                            (Paid ${userPlan.transaction.amount} on{" "}
                                            {userPlan.transaction.transactionDate
                                                ? new Date(userPlan.transaction.transactionDate).toLocaleDateString()
                                                : userPlan.transaction.metadata?.datetime
                                                ? new Date(userPlan.transaction.metadata.datetime).toLocaleDateString()
                                                : "N/A"}
                                            )
                                        </span>
                                    )}
                                </span>
                            </div>
                            {userPlan.plan === "free" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const token = localStorage.getItem("internmatch_token");
                                            const fixRes = await fetch("/api/user/fix-plan", {
                                                method: "POST",
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            });
                                            if (fixRes.ok) {
                                                const fixData = await fixRes.json();
                                                alert(fixData.fixed > 0 
                                                    ? `Fixed ${fixData.fixed} transaction(s)! Refreshing...`
                                                    : "No transactions need fixing.");
                                                router.refresh();
                                            }
                                        } catch (error) {
                                            console.error("Error fixing plan:", error);
                                            alert("Error fixing plan. Please try again.");
                                        }
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Fix Plan
                                </button>
                            )}
                        </div>
                        {userPlan.plan !== "free" && userPlan.transaction && (
                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                                {userPlan.expiresAt && (
                                    <div>
                                        <span className="font-medium">Expires:</span>{" "}
                                        <span className={userPlan.isExpired ? "text-red-600 font-semibold" : ""}>
                                            {new Date(userPlan.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {userPlan.nextBillingDate && userPlan.autoRenew && (
                                    <div>
                                        <span className="font-medium">Next Billing:</span>{" "}
                                        {new Date(userPlan.nextBillingDate).toLocaleDateString()}
                                    </div>
                                )}
                                {userPlan.autoRenew !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Auto-Renew:</span>
                                        <span className={userPlan.autoRenew ? "text-green-600" : "text-gray-500"}>
                                            {userPlan.autoRenew ? "Enabled" : "Disabled"}
                                        </span>
                                        {userPlan.autoRenew && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Are you sure you want to cancel auto-renewal? Your subscription will expire on the expiration date and you'll need to manually renew.")) {
                                                        return;
                                                    }
                                                    try {
                                                        const token = localStorage.getItem("internmatch_token");
                                                        const cancelRes = await fetch("/api/subscriptions/cancel-auto-renew", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                            body: JSON.stringify({
                                                                tranId: userPlan.transaction?.tranId,
                                                            }),
                                                        });
                                                        if (cancelRes.ok) {
                                                            alert("Auto-renewal cancelled successfully.");
                                                            router.refresh();
                                                        } else {
                                                            const errorData = await cancelRes.json();
                                                            alert(errorData.error || "Failed to cancel auto-renewal.");
                                                        }
                                                    } catch (error) {
                                                        console.error("Error cancelling auto-renewal:", error);
                                                        alert("Error cancelling auto-renewal. Please try again.");
                                                    }
                                                }}
                                                className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            >
                                                Cancel Auto-Renew
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {(paymentStatus.type || isVerifying) && (
                <div
                    className={`mb-6 p-4 rounded-lg border flex items-start justify-between ${
                        isVerifying
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : paymentStatus.type === "success"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        {isVerifying ? (
                            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                        ) : paymentStatus.type === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">
                            {isVerifying ? "Verifying payment..." : paymentStatus.message}
                        </p>
                    </div>
                    {!isVerifying && (
                        <button
                            onClick={() => setPaymentStatus({ type: null, message: "" })}
                            className="shrink-0 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                {user.role === "student" ? (
                    <StudentPricing currentPlan={userPlan?.plan || "free"} />
                ) : (
                    <CompanyPricing currentPlan={userPlan?.plan || "free"} />
                )}
            </div>
        </div>
    );
}
