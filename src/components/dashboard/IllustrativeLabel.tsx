import { cn } from "@/lib/utils";
import { Beaker } from "lucide-react";

interface IllustrativeLabelProps {
  className?: string;
  variant?: "inline" | "corner";
}

export function IllustrativeLabel({ className, variant = "inline" }: IllustrativeLabelProps) {
  if (variant === "corner") {
    return (
      <div 
        className={cn(
          "absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium",
          "bg-muted/60 text-muted-foreground backdrop-blur-sm",
          className
        )}
      >
        <Beaker className="w-3 h-3" />
        <span>Illustrative</span>
      </div>
    );
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
        "bg-muted/50 text-muted-foreground",
        className
      )}
    >
      <Beaker className="w-2.5 h-2.5" />
      <span>Illustrative data</span>
    </span>
  );
}
