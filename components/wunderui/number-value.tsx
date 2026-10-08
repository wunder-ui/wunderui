import { cn } from "@/lib/utils"
import { TrendCaret } from "./trend-chip"

/**
 * Figma Number Value: the number at 24 px bold, the change beside it on the
 * baseline as a filled caret plus 12 px label. Trend (up, down, none) says
 * which way the caret points, `trendGood` whether that is green or red.
 */
function NumberValue({
  value,
  delta,
  trend,
  trendGood = true,
  className,
}: {
  value: string
  delta?: string
  trend?: "up" | "down"
  trendGood?: boolean
  className?: string
}) {
  return (
    <div data-slot="number-value" className={cn("flex items-end gap-2", className)}>
      <span className="text-2xl font-bold leading-[1.2] tabular-nums text-foreground">{value}</span>
      {delta && trend && (
        <span
          className={cn(
            "flex items-center gap-0.5 pb-1 text-xs font-semibold leading-4",
            trendGood ? "text-text-success" : "text-text-error"
          )}
        >
          <TrendCaret large down={trend === "down"} />
          {delta}
        </span>
      )}
    </div>
  )
}

export { NumberValue }
