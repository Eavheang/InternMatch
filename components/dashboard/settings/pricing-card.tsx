import { CheckIcon } from "lucide-react";

interface PricingCardProps {
    title: string;
    price: string;
    features: string[];
    onSubscribe: () => void;
    isCurrentPlan?: boolean;
    buttonText?: string;
    description?: string;
}

export function PricingCard({
    title,
    price,
    features,
    onSubscribe,
    isCurrentPlan = false,
    buttonText = "Subscribe",
    description,
}: PricingCardProps) {
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
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-zinc-600">
                        <CheckIcon className="h-5 w-5 text-indigo-600 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
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
