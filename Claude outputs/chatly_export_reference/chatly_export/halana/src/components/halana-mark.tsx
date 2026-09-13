import { CakeSlice } from "lucide-react";
import { cn } from "@/lib/utils";

type HalanaMarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
};

const sizeClasses = {
  sm: "size-9 rounded-lg",
  md: "size-11 rounded-xl",
  lg: "size-14 rounded-2xl",
};

export function HalanaMark({ className, size = "md", inverse = false }: HalanaMarkProps) {
  const iconSize = size === "sm" ? 17 : size === "md" ? 21 : 27;

  return (
    <span
      aria-label="دمغة حلانا1"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm",
        sizeClasses[size],
        inverse
          ? "border-white/20 bg-white/10 text-[#f2c6d1]"
          : "border-[#e3b9c5] bg-[#fff9f4] text-[#a83c65]",
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <CakeSlice size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
