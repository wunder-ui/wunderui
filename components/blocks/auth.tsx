"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon-provider"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { InputGroupCopy } from "@/components/ui/input-group"
import { NativeSelect, NativeSelectContent, NativeSelectItem, NativeSelectTrigger, NativeSelectValue } from "@/components/ui/native-select"
import { OtpFieldCode, type OtpFieldCodeProps } from "@/components/ui/otp-field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Alert } from "@/components/ui/alert"
import { AvatarLabel, type AvatarColor } from "@/components/ui/avatar"
import { Badge, type BadgeColor } from "@/components/ui/badge"

/* ------------------------------------------------------------------ */
/* Text Link Row — “Don't have an account? Sign up”                    */
/* Figma: A. Custom Components / Text Link Row (634:2563)              */
/* ------------------------------------------------------------------ */

type TextLinkRowProps = {
  /** Leading copy, e.g. "Don't have an account?" */
  text: React.ReactNode
  /** Link label, e.g. "Sign up". Omitted for Type=back. */
  link?: React.ReactNode
  href?: string
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** inline (14px) · small (12px) · stacked (two lines, centered) · icon (help icon + small) · back (arrow, no link) */
  variant?: "inline" | "small" | "stacked" | "icon" | "back"
  className?: string
}

function TextLinkRow({
  text,
  link,
  href = "#",
  onLinkClick,
  variant = "inline",
  className,
}: TextLinkRowProps) {
  const small = variant === "small" || variant === "icon"
  const linkEl = link ? (
    <a
      href={href}
      onClick={onLinkClick}
      className={cn(
        "font-semibold text-text-link underline-offset-4 hover:underline",
        small ? "text-xs" : "text-sm"
      )}
    >
      {link}
    </a>
  ) : null

  if (variant === "back") {
    return (
      <a
        href={href}
        onClick={onLinkClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-sm text-sm font-medium text-text-secondary hover:text-foreground outline-none focus-ring",
          className
        )}
      >
        <Icon name="arrowLeft" className="size-4" strokeWidth={1.5} />
        {text}
      </a>
    )
  }

  return (
    <p
      data-slot="text-link-row"
      className={cn(
        "flex items-center gap-1",
        variant === "stacked" && "flex-col gap-1 text-center",
        small ? "text-xs text-text-tertiary" : "text-sm text-text-secondary",
        variant === "stacked" && "text-text-tertiary",
        className
      )}
    >
      {variant === "icon" && <Icon name="help" className="me-1 size-4 shrink-0" strokeWidth={1.5} />}
      <span>{text}</span>
      {linkEl}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* Social Sign-in Buttons                                              */
/* Figma: Social Sign-in Buttons (634:2534)                            */
/* ------------------------------------------------------------------ */

type SocialProvider = "google" | "apple" | "github" | "microsoft"

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
  microsoft: "Microsoft",
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-3-4.1ZM14 5.4c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  )
}

const PROVIDER_MARK: Record<SocialProvider, () => React.JSX.Element> = {
  google: GoogleMark,
  apple: AppleMark,
  github: GitHubMark,
  microsoft: MicrosoftMark,
}

type SocialSignInButtonsProps = {
  providers?: SocialProvider[]
  /** horizontal = one row, vertical = stacked full-width buttons */
  layout?: "horizontal" | "vertical"
  /** "Continue with" / "Sign in with" prefix; pass "" for icon + name only. */
  prefix?: string
  onSelect?: (provider: SocialProvider) => void
  className?: string
}

function SocialSignInButtons({
  providers = ["google", "github"],
  layout = "horizontal",
  prefix = "Continue with",
  onSelect,
  className,
}: SocialSignInButtonsProps) {
  return (
    <div
      data-slot="social-sign-in"
      className={cn(
        "grid gap-3",
        layout === "horizontal" ? "grid-cols-1 sm:grid-flow-col sm:auto-cols-fr" : "grid-cols-1",
        className
      )}
    >
      {providers.map((provider) => {
        const Mark = PROVIDER_MARK[provider]
        return (
          <Button
            key={provider}
            type="button"
            variant="plain"
            size="lg"
            shape="rounded"
            className="w-full"
            onClick={() => onSelect?.(provider)}
          >
            <Mark />
            {prefix ? `${prefix} ${PROVIDER_LABEL[provider]}` : PROVIDER_LABEL[provider]}
          </Button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Option Row — selectable card with radio/checkbox, title, description */
/* Figma: Option Row (634:2681)                                        */
/* ------------------------------------------------------------------ */

type OptionRowProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Leading icon (rendered in a 40px tint-indigo tile with a tint-text rim for variant="icon") */
  icon?: React.ReactNode
  /** Small badge next to the title, e.g. "Recommended" */
  badge?: React.ReactNode
  badgeColor?: BadgeColor
  selected?: boolean
  /** radio (default) · checkbox · link (chevron, no control) · icon (icon box + trailing radio) */
  variant?: "radio" | "checkbox" | "link" | "icon"
  /** Required for radio/checkbox variants — the RadioGroupItem / Checkbox value. */
  value?: string
  /** Dims the row once (the row, not its control as well), turns the control or link off and takes it out of the arrow-key order. A disabled `OptionRowGroup` disables every row in it. */
  disabled?: boolean
  onSelect?: () => void
  href?: string
  className?: string
  /** Names the control (radio, checkbox) or the link when the row has no visible text to name it. */
  "aria-label"?: string
  /** Names the control by another element, for a row whose label is somewhere else. */
  "aria-labelledby"?: string
  /** Extra description for the control, for example the id of a hint under the row. */
  "aria-describedby"?: string
}

type OptionRowGroupContextValue = { disabled?: boolean; invalid?: boolean }
const OptionRowGroupContext = React.createContext<OptionRowGroupContextValue>({})

// On the selected row (tint surface, tint-text border) the mark takes the tint colours of the same hue:
// filled box in tint-text, check or dot in tint. The dark: and focus variants repeat the base ones so they cannot win.
const SELECTED_MARK =
  "data-checked:border-tint-text-indigo data-checked:bg-tint-text-indigo data-checked:text-tint-indigo dark:data-checked:bg-tint-text-indigo group-has-[:focus-visible]/field-label:data-checked:border-tint-text-indigo dark:group-aria-invalid/radio-group:data-checked:border-tint-text-indigo group-aria-invalid/radio-group:data-checked:border-tint-text-indigo hover:data-checked:bg-tint-text-indigo active:data-checked:bg-tint-text-indigo hover:data-checked:not-aria-invalid:border-tint-text-indigo active:data-checked:not-aria-invalid:border-tint-text-indigo aria-invalid:data-checked:border-tint-text-indigo"

/** @deprecated Use `SelectorItem` (`icon`, `badge`, `href`, selected look) inside a `SelectorItemGroup`. */
function OptionRow({
  title,
  description,
  icon,
  badge,
  badgeColor = "green",
  selected = false,
  variant = "radio",
  value,
  disabled: disabledProp,
  onSelect,
  href,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: OptionRowProps) {
  const group = React.useContext(OptionRowGroupContext)
  const disabled = disabledProp || (variant !== "checkbox" && variant !== "link" && group.disabled) || undefined
  // A row in an invalid group that is not the chosen one takes the error tint (red rim + tint/red surface).
  // The chosen row keeps its indigo tint: it is a valid choice, and the mark rules above already keep it indigo.
  const errorTint = Boolean(group.invalid) && !selected && (variant === "radio" || variant === "icon")
  const frame = cn(
    "flex w-full items-start gap-3 rounded-xl border p-4 text-start transition-colors duration-fast ease-entrance",
    selected
      ? "border-[1.5px] border-tint-text-indigo bg-tint-indigo"
      : errorTint
        ? "border-destructive/60 bg-tint-red hover:bg-tint-red active:bg-tint-red"
        : "border-border bg-card hover:bg-bg-page active:bg-bg-subtle",
    // One dimming, on the row. The control inside is not dimmed a second time (data-disabled:opacity-100 below).
    disabled && "pointer-events-none opacity-50",
    className
  )
  const controlA11y = { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby }
  const titleColor = selected ? "text-tint-text-indigo" : "text-foreground"
  const descColor = selected ? "text-tint-text-indigo" : "text-text-secondary"

  const body = (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-semibold", titleColor)}>{title}</span>
        {badge && (
          <Badge color={badgeColor} badgeStyle="light" shape="pill">
            {badge}
          </Badge>
        )}
      </div>
      {description && <span className={cn("text-xs", descColor)}>{description}</span>}
    </div>
  )

  if (variant === "link") {
    return (
      <a
        href={href ?? "#"}
        onClick={(event) => {
          // Without a real href the row is an action: no jump to "#".
          if (href === undefined || disabled) event.preventDefault()
          if (!disabled) onSelect?.()
        }}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        tabIndex={disabled ? -1 : undefined}
        className={cn(frame, "items-center py-3")}
      >
        {icon && <span className="text-text-secondary [&_svg]:size-[18px]">{icon}</span>}
        {body}
        <Icon name="chevronRight" className="size-4 text-text-tertiary" />
      </a>
    )
  }

  const control =
    variant === "checkbox" ? (
      <Checkbox
        value={value}
        checked={selected}
        disabled={disabled}
        onCheckedChange={() => onSelect?.()}
        className={cn("mt-0.5 data-disabled:opacity-100", selected && SELECTED_MARK)}
        {...controlA11y}
      />
    ) : (
      <RadioGroupItem
        value={value ?? String(title)}
        disabled={disabled}
        tone={selected ? "tint" : "default"}
        className="mt-0.5 data-disabled:opacity-100"
        {...controlA11y}
      />
    )

  return (
    <label
      data-slot="option-row"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(frame, "cursor-pointer")}
    >
      {variant === "icon" ? (
        <>
          <span
            data-slot="option-row-icon"
            className="grid size-10 shrink-0 place-items-center rounded-md bg-tint-indigo text-tint-text-indigo [&_svg]:size-5"
          >
            {icon}
          </span>
          {body}
          {control}
        </>
      ) : (
        <>
          {control}
          {body}
        </>
      )}
    </label>
  )
}

type OptionRowGroupProps = {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  /** Name of the group in a form: the chosen value is submitted under it (the radios carry hidden inputs). */
  name?: string
  /** A choice is required before the form can be submitted (`aria-required`, and native validation on submit). */
  required?: boolean
  /** Disables every row in the group. Disabled rows are skipped by the arrow keys. */
  disabled?: boolean
  /** Marks the group invalid (`aria-invalid`) and gives the rows that are not chosen the error tint. Implied by `error`. */
  invalid?: boolean
  /** Error message under the list; marks the group invalid and is linked with `aria-describedby`. Announced when it appears. */
  error?: React.ReactNode
  /** Names the radiogroup. Give this or `aria-labelledby`, or wrap the group in a fieldset with a legend. */
  "aria-label"?: string
  /** Names the radiogroup by another element, for example a heading. */
  "aria-labelledby"?: string
  /** Extra description, for example the id of a hint. The error message is added to it. */
  "aria-describedby"?: string
}

/**
 * @deprecated Use `SelectorItemGroup` (same group props).
 *
 * Radio-mode wrapper: keeps one OptionRow selected. It is a radiogroup, so arrow keys move focus and choose, the group is
 * one tab stop, and disabled rows are skipped. Without `error` it renders the radiogroup alone, as before.
 */
function OptionRowGroup({
  value,
  onValueChange,
  children,
  className,
  name,
  required,
  disabled,
  invalid,
  error,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: OptionRowGroupProps) {
  const errorId = React.useId()
  const hasError = error !== undefined && error !== null && error !== false && error !== ""
  const isInvalid = Boolean(invalid) || hasError
  const describedBy = [ariaDescribedby, hasError ? errorId : undefined].filter(Boolean).join(" ") || undefined
  const context = React.useMemo(() => ({ disabled, invalid: isInvalid }), [disabled, isInvalid])
  const radios = (
    <OptionRowGroupContext.Provider value={context}>
      <RadioGroup
        value={value}
        onValueChange={(v) => onValueChange?.(String(v))}
        name={name}
        required={required}
        disabled={disabled}
        invalid={isInvalid}
        // Only defined names are passed, so a fieldset legend that names the group is not overwritten with undefined.
        {...(ariaLabel ? { "aria-label": ariaLabel } : null)}
        {...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : null)}
        {...(describedBy ? { "aria-describedby": describedBy } : null)}
        className={cn("flex flex-col gap-3", className)}
      >
        {children}
      </RadioGroup>
    </OptionRowGroupContext.Provider>
  )
  if (!hasError) return radios
  return (
    <div data-slot="option-row-group-field" className="flex w-full min-w-0 flex-col gap-2">
      {radios}
      <p id={errorId} data-slot="option-row-group-error" role="alert" className="text-xs text-text-error">
        {error}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* User Info — avatar + name + secondary line                          */
/* Figma: User Info (634:2727)                                         */
/* ------------------------------------------------------------------ */

type UserInfoProps = {
  name: string
  subtext?: string
  src?: string
  initials?: string
  color?: AvatarColor
  /** person (42px avatar, 14px name) · sidebar (40px, 12px, padded) · menu (adds a ⋮ button) */
  variant?: "person" | "sidebar" | "menu"
  onMenu?: () => void
  className?: string
}

/** @deprecated Use `AvatarLabel` (`name`, `subtext`, `size`, `compact`, `trailing`). Renders the same row. */
function UserInfo({ name, subtext, src, initials, color, variant = "person", onMenu, className }: UserInfoProps) {
  const compact = variant !== "person"
  return (
    <AvatarLabel
      name={name}
      subtext={subtext}
      src={src}
      initials={initials}
      color={color}
      size={compact ? "lg" : "xl"}
      compact={compact}
      nameWeight="semibold"
      tight
      trailing={
        variant === "menu" ? (
          <IconButton variant="ghost" size="sm" aria-label="More" onClick={onMenu}>
            <Icon name="moreVertical" className="size-4" strokeWidth={1.5} />
          </IconButton>
        ) : undefined
      }
      className={cn(compact && "rounded-xl p-2", className)}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Password Requirement + Password Strength                            */
/* Figma: Password Requirement (634:2599), Password Strength (634:2632) */
/* ------------------------------------------------------------------ */

function PasswordRequirement({ met, children, className }: { met: boolean; children: React.ReactNode; className?: string }) {
  return (
    <li
      data-slot="password-requirement"
      data-met={met || undefined}
      className={cn("flex items-center gap-2 text-xs", met ? "text-text-secondary" : "text-text-tertiary", className)}
    >
      {met ? <Icon name="success" className="size-4 shrink-0 text-success" strokeWidth={1.5} /> : <Icon name="pending" className="size-4 shrink-0" strokeWidth={1.5} />}
      {children}
    </li>
  )
}

type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong"

const STRENGTH: Record<PasswordStrengthLevel, { filled: number; bar: string; text: string; label: string }> = {
  weak: { filled: 1, bar: "bg-destructive", text: "text-text-error", label: "Weak password" },
  fair: { filled: 2, bar: "bg-brand-quaternary", text: "text-text-warning", label: "Fair password" },
  good: { filled: 3, bar: "bg-brand-secondary", text: "text-tint-text-blue", label: "Good password" },
  strong: { filled: 4, bar: "bg-success", text: "text-text-success", label: "Strong password" },
}

function PasswordStrength({
  strength,
  label,
  className,
}: {
  strength: PasswordStrengthLevel
  label?: string
  className?: string
}) {
  const s = STRENGTH[strength]
  return (
    <div data-slot="password-strength" className={cn("flex flex-col gap-1.5", className)} aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < s.filled ? s.bar : "bg-border")} />
        ))}
      </div>
      <p className={cn("text-xs", s.text)}>{label ?? s.label}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* OTP Code Input — deprecated alias of OtpFieldCode                   */
/* ------------------------------------------------------------------ */

/** @deprecated Use `OtpFieldCodeProps`. */
type OtpCodeInputProps = OtpFieldCodeProps

/** @deprecated Use `OtpFieldCode` (same props). */
const OtpCodeInput = OtpFieldCode

/* ------------------------------------------------------------------ */
/* Backup Code — monospace-ish code pill with copy                     */
/* Figma: Backup Code (637:26576)                                      */
/* ------------------------------------------------------------------ */

function BackupCode({ code, used, onCopy, className }: { code: string; used?: boolean; onCopy?: (code: string) => void; className?: string }) {
  const copy = () => {
    // Report a copy only once the clipboard took it (blocked in iframes, on http, or denied).
    navigator.clipboard?.writeText(code).then(() => onCopy?.(code), () => {})
  }
  return (
    <button
      type="button"
      data-slot="backup-code"
      onClick={copy}
      disabled={used}
      title="Copy code"
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium tabular-nums text-foreground transition-colors duration-base ease-entrance hover:bg-muted/50 outline-none focus-ring disabled:line-through disabled:text-text-tertiary",
        className
      )}
    >
      {code}
      <Icon name="copy" strokeWidth={1.5} className="size-3.5 text-text-tertiary opacity-0 transition-opacity duration-fast ease-entrance group-hover:opacity-100" />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Invite Row — email + role (+ remove) / share link + copy            */
/* Figma: Invite Row (637:26587)                                       */
/* ------------------------------------------------------------------ */

type InviteRowProps = {
  email: string
  role: string
  roles?: string[]
  onEmailChange?: (email: string) => void
  onRoleChange?: (role: string) => void
  onRemove?: () => void
  /** Stack email over role on small screens (Figma Type=email role stacked). */
  stacked?: boolean
  className?: string
}

function InviteRow({
  email,
  role,
  roles = ["Admin", "Editor", "Viewer"],
  onEmailChange,
  onRoleChange,
  onRemove,
  stacked,
  className,
}: InviteRowProps) {
  return (
    <div
      data-slot="invite-row"
      className={cn("flex gap-2", stacked ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:gap-3", className)}
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => onEmailChange?.(e.target.value)}
        placeholder="info@wunderui.com"
        aria-label="Email"
        className="sm:flex-1"
      />
      <div className="flex items-center gap-2">
        <NativeSelect value={role} onValueChange={(v) => onRoleChange?.(String(v))}>
          <NativeSelectTrigger aria-label="Role" className="min-w-36 flex-1">
            <NativeSelectValue />
          </NativeSelectTrigger>
          <NativeSelectContent>
            {roles.map((r) => (
              <NativeSelectItem key={r} value={r}>
                {r}
              </NativeSelectItem>
            ))}
          </NativeSelectContent>
        </NativeSelect>
        {onRemove && (
          <IconButton variant="plain" size="md" aria-label="Remove" onClick={onRemove}>
            <Icon name="close" className="size-4" strokeWidth={1.5} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use `InputGroupCopy` (`value` instead of `link`, `copyLabel="Copy link"` for the old label). */
function InviteLinkRow({ link, onCopy, className }: { link: string; onCopy?: () => void; className?: string }) {
  return <InputGroupCopy value={link} onCopy={() => onCopy?.()} copyLabel="Copy link" aria-label="Invite link" className={className} />
}

/* ------------------------------------------------------------------ */
/* Settings Row — title + description with a trailing control          */
/* Figma: Settings Row (637:26634)                                     */
/* ------------------------------------------------------------------ */

type SettingsRowProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Trailing control: a Button, Switch, Badge … Pass `switch` props instead for the toggle variant. */
  control?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

function SettingsRow({ title, description, control, checked, onCheckedChange, className }: SettingsRowProps) {
  const toggle = onCheckedChange !== undefined || checked !== undefined
  const id = React.useId()
  return (
    <div data-slot="settings-row" className={cn("flex items-center justify-between gap-6", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p id={id} className="text-sm font-medium text-foreground">
          {title}
        </p>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
      {toggle ? (
        <Switch aria-labelledby={id} checked={checked} onCheckedChange={onCheckedChange} />
      ) : (
        control
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Inline Note — small hint line with icon                             */
/* Figma: Inline Note (634:2738)                                       */
/* ------------------------------------------------------------------ */

/** @deprecated Use `<Alert size="inline">` (`variant="plain"` for neutral, `variant="warning"` for warning). */
function InlineNote({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: "neutral" | "warning"
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Alert
      size="inline"
      variant={tone === "warning" ? "warning" : "plain"}
      icon={icon}
      // The note keeps its look: the warning text stays secondary and only the icon takes the warning colour.
      className={cn(tone === "warning" && "text-text-secondary [&_[data-slot=alert-icon]]:text-text-warning", className)}
    >
      {children}
    </Alert>
  )
}

export { TextLinkRow, SocialSignInButtons, OptionRow, OptionRowGroup, UserInfo, PasswordRequirement, PasswordStrength, OtpCodeInput, BackupCode, InviteRow, InviteLinkRow, SettingsRow, InlineNote }
export type { TextLinkRowProps, SocialProvider, OptionRowProps, OptionRowGroupProps, UserInfoProps, PasswordStrengthLevel, OtpCodeInputProps, InviteRowProps, SettingsRowProps }
