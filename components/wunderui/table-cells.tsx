"use client"

import type { ReactNode } from "react"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge, type BadgeColor, type BadgeStyle } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { IconButton } from "@/components/ui/icon-button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Rating } from "@/components/wunderui/rating"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  NativeSelect,
  NativeSelectTrigger,
  NativeSelectValue,
  NativeSelectContent,
  NativeSelectItem,
} from "@/components/ui/native-select"
import { cn } from "@/lib/utils"

/**
 * The cell types of the Figma "Table Item" set. A data grid is mostly the same
 * handful of shapes repeated — a name over an email, a figure with its delta,
 * a control — so they live here as named pieces rather than being rebuilt in
 * every table.
 *
 * Two column heights recur: a single line of text sits in a 36 px row, a
 * two-line cell (user, company, product, address) in a 54 px one.
 */

const CELL_COLOR_SWATCHES = ["#12AFF0", "#A584F3", "#F3654A", "#FACA4A", "#1AD598", "#EC4899"]

/** Plain cell text. */
function TextCell({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-sm text-text-secondary", className)}>{children}</span>
}

/** Column header label — the only uppercase-weight cell in the set. */
function HeadingCell({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-xs font-semibold text-muted-foreground", className)}>{children}</span>
}

/** Name over email, with an avatar or a generic person glyph. */
function UserCell({
  name,
  email,
  avatarSrc,
  initials,
  avatarSize = "sm",
}: {
  name: string
  email?: string
  avatarSrc?: string
  initials?: string
  /** Avatar size; use "default" (36 px) when the cell shows name and email on two lines. */
  avatarSize?: "sm" | "xs" | "default" | "lg"
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size={avatarSize}>
        {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
        <AvatarFallback>{initials ?? name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {email && <span className="text-xs text-muted-foreground">{email}</span>}
      </div>
    </div>
  )
}

/** Same shape as UserCell, but always a real avatar image or initials. */
function UserAvatarCell(props: Parameters<typeof UserCell>[0]) {
  return <UserCell {...props} />
}

function BadgeCell({
  label,
  color = "blue",
  badgeStyle = "light_border",
}: {
  label: string
  color?: BadgeColor
  badgeStyle?: BadgeStyle
}) {
  return (
    <Badge color={color} badgeStyle={badgeStyle}>
      {label}
    </Badge>
  )
}

function CurrencyCell({ value, currency = "$" }: { value: number; currency?: string }) {
  return (
    <span className="text-sm font-semibold text-muted-foreground">
      {currency}
      {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}

/** A figure with its change — the delta is green when it is good news. */
function PerformanceCell({
  value,
  delta,
  good = true,
}: {
  value: string
  delta?: string
  good?: boolean
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {delta && (
        <span className={cn("text-xs font-medium", good ? "text-text-success" : "text-text-error")}>{delta}</span>
      )}
    </div>
  )
}

/** Logo square, company name, domain. */
function CompanyCell({ name, domain, logoSrc }: { name: string; domain?: string; logoSrc?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-8 shrink-0 overflow-hidden rounded-md bg-muted">
        {logoSrc && <img src={logoSrc} alt="" className="size-full object-cover" />}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-tertiary">{name}</span>
        {domain && <span className="text-xs text-muted-foreground">{domain}</span>}
      </div>
    </div>
  )
}

/** Thumbnail, product name, SKU. */
function ProductCell({ name, sku, imageSrc }: { name: string; sku?: string; imageSrc?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-8 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageSrc && <img src={imageSrc} alt="" className="size-full object-cover" />}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {sku && <span className="text-xs text-muted-foreground">{sku}</span>}
      </div>
    </div>
  )
}

/** Street over city — two lines, no leading element. */
function AddressCell({ street, city }: { street: string; city?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-foreground">{street}</span>
      {city && <span className="text-xs text-muted-foreground">{city}</span>}
    </div>
  )
}

/** An icon beside a label. */
function IconTextCell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex shrink-0 items-center text-foreground [&_svg]:size-5">{icon}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

/** A small framed icon button beside a label. */
function IconButtonTextCell({
  icon,
  children,
  onClick,
  label,
}: {
  icon: ReactNode
  children: ReactNode
  onClick?: () => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <IconButton variant="plain" size="sm" aria-label={label ?? "Action"} onClick={onClick}>
        {icon}
      </IconButton>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

/** A row of bare icon actions — edit, delete, view and the like. */
function ActionIconsCell({
  actions,
}: {
  actions: { icon: ReactNode; label: string; onClick?: () => void }[]
}) {
  return (
    <div className="flex items-center gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          aria-label={action.label}
          onClick={action.onClick}
          className="text-foreground transition-colors duration-fast ease-move hover:text-text-link [&_svg]:size-4"
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}

/** The filled call-to-action a row can carry. */
function CTAButtonCell({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <Button variant="primary" size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

/** The quieter sibling of CTAButtonCell. */
function ButtonCell({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <Button variant="plain" size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

/** Drag handle in front of the row label. */
function DragItemCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <GripVertical className="size-4 shrink-0 cursor-grab text-text-tertiary" />
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

function CheckItemCell({
  children,
  checked,
  onCheckedChange,
}: {
  children?: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      {children && <span className="text-sm text-foreground">{children}</span>}
    </label>
  )
}

function RadioItemCell({
  children,
  value,
  selected,
  onSelect,
}: {
  children?: ReactNode
  value: string
  selected?: string
  onSelect?: (value: string) => void
}) {
  return (
    <RadioGroup value={selected} onValueChange={(v) => onSelect?.(String(v))}>
      <label className="flex items-center gap-3">
        <RadioGroupItem value={value} />
        {children && <span className="text-sm text-foreground">{children}</span>}
      </label>
    </RadioGroup>
  )
}

function SwitchItemCell({
  children,
  checked,
  onCheckedChange,
}: {
  children?: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {children && <span className="text-sm text-foreground">{children}</span>}
    </label>
  )
}

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{value}%</span>
    </div>
  )
}

/** A dismissible label — the Figma "Tag" cell is a badge with a cross. */
function TagCell({
  label,
  color = "indigo",
  onRemove,
}: {
  label: string
  color?: BadgeColor
  onRemove?: () => void
}) {
  return (
    <Badge color={color} badgeStyle="light" shape="pill">
      {label}
      {onRemove && (
        <button type="button" aria-label={`Remove ${label}`} onClick={onRemove} className="-mr-0.5 ml-0.5">
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </Badge>
  )
}

/** Stars with the value beside them. */
function RatingCell({ value, max = 5 }: { value: number; max?: number }) {
  return <Rating value={value} max={max} label="right" readOnly />
}

function ActionItemsCell({ actions }: { actions: { label: string; onClick?: () => void; muted?: boolean }[] }) {
  return (
    <div className="flex items-center gap-4">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={cn("text-[13px] font-medium", a.muted ? "text-muted-foreground" : "text-text-link")}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}

function CellSwitch({
  checked,
  onCheckedChange,
  "aria-label": ariaLabel = "Toggle",
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Name for screen readers — a cell has no visible label of its own. */
  "aria-label"?: string
}) {
  return <Switch aria-label={ariaLabel} checked={checked} onCheckedChange={onCheckedChange} />
}

function CellSlider({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="flex w-28 items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs text-text-tertiary">{value}</span>
    </div>
  )
}

function CellSelect({
  value,
  onValueChange,
  options,
  "aria-label": ariaLabel = "Choose a value",
}: {
  value: string
  onValueChange: (value: string) => void
  options: string[]
  /** Name for screen readers — a combobox is not named by its current value. */
  "aria-label"?: string
}) {
  return (
    <NativeSelect value={value} onValueChange={(v) => v && onValueChange(v)}>
      <NativeSelectTrigger aria-label={ariaLabel} className="h-8 w-32 px-2 text-xs">
        <NativeSelectValue />
      </NativeSelectTrigger>
      <NativeSelectContent>
        {options.map((option) => (
          <NativeSelectItem key={option} value={option}>
            {option}
          </NativeSelectItem>
        ))}
      </NativeSelectContent>
    </NativeSelect>
  )
}

function CellColorPicker({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Colour ${value}. Choose a colour`}
        className="size-6 rounded-full ring-1 ring-border ring-offset-2 ring-offset-card outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={{ backgroundColor: value }}
      />
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-6 gap-1.5">
          {CELL_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={swatch}
              aria-pressed={value === swatch}
              onClick={() => onValueChange(swatch)}
              className={cn(
                "size-6 rounded-full transition-transform hover:scale-110",
                value === swatch && "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** The default icon set for ActionIconsCell — edit, delete, view. */
const TABLE_ACTION_ICONS = {
  edit: <Pencil />,
  delete: <Trash2 />,
} as const

export {
  TextCell,
  HeadingCell,
  UserCell,
  UserAvatarCell,
  BadgeCell,
  CurrencyCell,
  PerformanceCell,
  CompanyCell,
  ProductCell,
  AddressCell,
  IconTextCell,
  IconButtonTextCell,
  ActionIconsCell,
  CTAButtonCell,
  ButtonCell,
  DragItemCell,
  CheckItemCell,
  RadioItemCell,
  SwitchItemCell,
  ProgressCell,
  TagCell,
  RatingCell,
  ActionItemsCell,
  CellSwitch,
  CellSlider,
  CellSelect,
  CellColorPicker,
  TABLE_ACTION_ICONS,
}
