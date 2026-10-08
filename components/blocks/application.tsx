"use client"

import * as React from "react"
import { Check, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage, type AvatarColor } from "@/components/ui/avatar"
import { Badge, type BadgeColor } from "@/components/ui/badge"

/* ------------------------------------------------------------------ */
/* Timeline Event — activity entry with avatar/status rail             */
/* Figma: Timeline Event (722:58517)                                   */
/* ------------------------------------------------------------------ */

type TimelineEventProps = {
  /** Actor avatar (Type=event). */
  avatar?: { src?: string; initials?: string; color?: AvatarColor }
  /** Status dot (Type=step): tone + icon. */
  status?: { tone?: "success" | "primary" | "warning" | "muted"; icon?: React.ReactNode }
  title: React.ReactNode
  time?: React.ReactNode
  /** Small object chip under the title (Type=event) — e.g. project name. */
  object?: { icon?: React.ReactNode; label: React.ReactNode }
  /** Trailing badge/label on the title row (Type=step). */
  badge?: React.ReactNode
  badgeColor?: BadgeColor
  meta?: React.ReactNode
  /** Extra content below the title (comment excerpt, reactions, attachments …). */
  children?: React.ReactNode
  /** Draw the connector line to the next entry. */
  last?: boolean
  className?: string
}

const STATUS_TONE = {
  success: "bg-success text-success-foreground",
  primary: "bg-primary text-primary-foreground",
  warning: "bg-brand-quaternary text-foreground",
  muted: "bg-muted text-text-secondary",
}

function TimelineEvent({ avatar, status, title, time, object, badge, badgeColor = "grey", meta, children, last, className }: TimelineEventProps) {
  const lineColor = status?.tone === "success" ? "bg-success" : "bg-border"
  return (
    <div data-slot="timeline-event" className={cn("flex gap-4", className)}>
      <div className="flex w-9 shrink-0 flex-col items-center">
        {avatar ? (
          <Avatar size="lg" color={avatar.src ? undefined : avatar.color}>
            {avatar.src && <AvatarImage src={avatar.src} alt="" />}
            <AvatarFallback>{avatar.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <span className={cn("grid size-8 place-items-center rounded-full [&_svg]:size-3.5", STATUS_TONE[status?.tone ?? "muted"])}>
            {status?.icon ?? <Check strokeWidth={3} />}
          </span>
        )}
        {!last && <span className={cn("mt-1 w-0.5 flex-1", lineColor)} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", !last && "pb-6")}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-text-secondary [&_strong]:font-medium [&_strong]:text-foreground">{title}</p>
          {time && <span className="shrink-0 text-xs text-text-tertiary">{time}</span>}
          {badge && (
            <Badge color={badgeColor} badgeStyle="light" shape="pill" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        {object && (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-text-secondary [&_svg]:size-3">
            {object.icon ?? <Folder />}
            {object.label}
          </span>
        )}
        {meta && <p className="text-xs text-text-tertiary">{meta}</p>}
        {children}
      </div>
    </div>
  )
}

export { TimelineEvent }
export type { TimelineEventProps }
