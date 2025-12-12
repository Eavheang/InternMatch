import { CheckIcon } from "lucide-react";

export interface FeatureUsage {
    feature: string;
    displayName: string;
    current: number;
    limit: number;
    percentage: number;
}

interface PricingCardProps {
    title: string;
    price: string;
    features: string[];
    onSubscribe: () => void;
    isCurrentPlan?: boolean;
    buttonText?: string;
    description?: string;
    usage?: FeatureUsage[];
}

export function PricingCard({
    title,
    price,
    features,
    onSubscribe,
    isCurrentPlan = false,
    buttonText = "Subscribe",
    description,
    usage,
}: PricingCardProps) {
    // Map feature strings to usage data
    const getUsageForFeature = (featureString: string): FeatureUsage | undefined => {
        if (!usage || !isCurrentPlan) return undefined;

        // Extract feature name from feature string (e.g., "Role suggestion: 1 times/month" -> "Role Suggestion")
        const featureName = featureString.split(":")[0].trim();

        return usage.find((u) => {
            const displayName = u.displayName.toLowerCase();
            const targetName = featureName.toLowerCase();
            return displayName === targetName || displayName.includes(targetName) || targetName.includes(displayName);
        });
    };

    // Get progress bar color based on percentage
    const getProgressColor = (percentage: number): string => {
        if (percentage >= 90) return "bg-rose-500";
        if (percentage >= 70) return "bg-amber-500";
        return "bg-indigo-600";
    };

    return (
        <div
            className={`relative flex flex-col p-6 bg-white rounded-2xl shadow-sm border ${isCurrentPlan ? "border-indigo-600 ring-1 ring-indigo-600" : "border-zinc-200"
                }`}
        >
            {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    Current Plan
                </div>
            )}
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
            </div>
            <div className="mb-5">
                <span className="text-3xl font-bold text-zinc-900">{price}</span>
                {price !== "Free" && <span className="text-zinc-500">/month</span>}
            </div>
            <ul className="flex-1 space-y-3 mb-6">
                {features.map((feature, index) => {
                    const featureUsage = getUsageForFeature(feature);

                    return (
                        <li key={index} className="text-sm text-zinc-600">
                            <div className="flex items-start gap-3">
                                <CheckIcon className="h-5 w-5 text-indigo-600 shrink-0" />
                                <div className="flex-1">
                                    <span>{feature}</span>
                                    {featureUsage && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                                <span>Used: {featureUsage.current}/{featureUsage.limit}</span>
                                                <span>{featureUsage.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(featureUsage.percentage)}`}
                                                    style={{ width: `${Math.min(featureUsage.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={onSubscribe}
                disabled={isCurrentPlan}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${isCurrentPlan
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
            >
                {isCurrentPlan ? "Active Plan" : buttonText}
            </button>
        </div>
    );
}
