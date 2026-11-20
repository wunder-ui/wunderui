"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { BrandMark, BRANDS, BRAND_NAMES, type BrandMarkProps, type BrandName } from "./brand-marks"

/* -------------------------------------------------------------------------- */
/* Brand Logo (Nov 19 2026): the public name of the product marks that list    */
/* rows, integration panels and buttons use (Figma ❖ List Panels · Logo /     */
/* <Name>). The artwork lives in brand-marks.tsx; IntegrationMark and           */
/* IntegrationLogo (Pro, List family) draw the same marks. Brand colours are the documented      */
/* exception to the token rule; the one-colour marks follow the text colour.   */
/* -------------------------------------------------------------------------- */

const BRAND_LOGO_SIZE = { sm: "size-4", md: "size-5", lg: "size-6" } as const

type BrandLogoProps = Omit<React.ComponentProps<"svg">, "name"> & {
  /** Which brand. */
  name: BrandName
  /** `sm` 16 px (beside small text and in buttons), `md` 20 px (default, list rows), `lg` 24 px. */
  size?: keyof typeof BRAND_LOGO_SIZE
  /** Accessible name. Defaults to the brand name; pass "" when the text beside it already names the brand. */
  label?: string
}

/**
 * A brand's logo at 16, 20 or 24 px: an image with the brand's name, or decorative with `label=""`. One-colour marks
 * (OpenAI, GitHub, Linear, Vercel) take the current text colour, so they turn white in dark mode.
 */
function BrandLogo({ name, size = "md", label, className, ...props }: BrandLogoProps) {
  const accessibleName = label ?? name
  return (
    <BrandMark
      data-slot="brand-logo"
      data-size={size}
      name={name}
      aria-label={accessibleName || undefined}
      className={cn(BRAND_LOGO_SIZE[size] ?? BRAND_LOGO_SIZE.md, className)}
      {...props}
    />
  )
}

export { BrandLogo, BrandMark, BRAND_NAMES, BRANDS }
export type { BrandLogoProps, BrandMarkProps, BrandName }
