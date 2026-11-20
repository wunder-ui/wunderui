"use client"

import { AvatarGroup, initialsOf, type Person } from "@/components/ui/avatar"

/** @deprecated Use `AvatarGroup` with `people`. This wrapper renders the same markup. */
function AvatarStack({ people, size = "sm", max = 3, className }: { people: Person[]; size?: "sm" | "xs" | "default"; max?: number; className?: string }) {
  return <AvatarGroup people={people} size={size} max={max} className={className} />
}

export { AvatarStack, initialsOf }
export type { Person }
