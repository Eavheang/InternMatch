"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MotionButtonProps extends ButtonProps {
    isLoading?: boolean;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ children, isLoading, className, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                asChild
                className={cn("relative overflow-hidden", className)}
                {...props}
            >
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    layout
                    transition={{
                        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
                        default: { duration: 0.2 },
                    }}
                    // If loading, we modify styles to center the loader and potentially shape it
                    className={cn(isLoading && "rounded-full px-2 w-10 h-10")}
                    disabled={isLoading || props.disabled}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2"
                            >
                                {children}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </Button>
        );
    }
);
MotionButton.displayName = "MotionButton";

export { MotionButton };
