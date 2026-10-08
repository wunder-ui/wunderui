"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"

const TOAST_TYPE_COLOR: Record<string, string> = {
  success: "var(--success)",
  error: "var(--destructive)",
  warning: "#FACA4A",
  info: "var(--primary)",
}

function ToastProvider({ children, timeout = 5000, ...props }: ToastPrimitive.Provider.Props) {
  return (
    <ToastPrimitive.Provider timeout={timeout} {...props}>
      {children}
    </ToastPrimitive.Provider>
  )
}

function ToastViewport({ className, position = "top-right", ...props }: ToastPrimitive.Viewport.Props & { position?: "top-right" | "bottom-right" }) {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        data-position={position}
        className={cn(
          "group/toast-viewport fixed right-4 z-[100] flex w-[420px] max-w-[calc(100vw-2rem)] flex-col gap-2",
          position === "bottom-right" ? "bottom-4" : "top-4",
          className
        )}
        {...props}
      />
    </ToastPrimitive.Portal>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((toast, index) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={cn(
        // Stacked at rest: each older toast sits a little lower, slightly
        // smaller and fainter behind the newest (--toast-index from Base UI);
        // hovering the viewport expands the stack into a list (--toast-offset-y).
        "absolute right-0 left-0 flex flex-col gap-1 rounded-md border border-border bg-card p-3 shadow-lg group-data-[position=top-right]/toast-viewport:top-0 group-data-[position=bottom-right]/toast-viewport:bottom-0",
        "transition-[transform,opacity,translate,scale] duration-slow ease-entrance",
        "group-data-[position=top-right]/toast-viewport:[transform:translateY(calc(min(var(--toast-index),3)*10px))_scale(calc(1-min(var(--toast-index),3)*0.05))]",
        "group-data-[position=top-right]/toast-viewport:data-[expanded]:[transform:translateY(var(--toast-offset-y))_scale(1)]",
        "group-data-[position=bottom-right]/toast-viewport:[transform:translateY(calc(min(var(--toast-index),3)*-10px))_scale(calc(1-min(var(--toast-index),3)*0.05))]",
        "group-data-[position=bottom-right]/toast-viewport:data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)*-1))_scale(1)]",
        "data-[ending-style]:opacity-0 data-[ending-style]:[transform:translateX(calc(100%+1rem))]",
        "data-[starting-style]:opacity-0 data-[starting-style]:[transform:translateX(calc(100%+1rem))]",
        "data-[expanded]:relative"
      )}
      style={{ zIndex: 100 - index, opacity: index > 3 ? 0 : undefined }}
    >
      <ToastPrimitive.Content data-slot="toast-content" className="flex items-start gap-3">
        <span
          className="mt-1 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: TOAST_TYPE_COLOR[toast.type ?? "info"] }}
        />
        <div className="flex flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title data-slot="toast-title" className="text-sm font-bold text-foreground" />
          {toast.description && (
            <ToastPrimitive.Description
              data-slot="toast-description"
              className="text-[13px] text-text-secondary"
            />
          )}
          {toast.actionProps && (
            // Figma Notification · Show action: inline text link (e.g. "Undo")
            <ToastPrimitive.Action
              data-slot="toast-action"
              className="mt-0.5 w-fit text-[13px] font-semibold text-text-link hover:underline"
            />
          )}
        </div>
        <ToastPrimitive.Close
          data-slot="toast-close"
          aria-label="Close"
          className="shrink-0 text-text-tertiary hover:text-foreground"
        >
          ×
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ))
}

function Toaster({
  children,
  position = "top-right",
}: {
  children: React.ReactNode
  /** Corner the stack lives in. */
  position?: "top-right" | "bottom-right"
}) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport position={position}>
        <ToastList />
      </ToastViewport>
    </ToastProvider>
  )
}

const useToast = ToastPrimitive.useToastManager

export { Toaster, ToastProvider, ToastViewport, useToast }
