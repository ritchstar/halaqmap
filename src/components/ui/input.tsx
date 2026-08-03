/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import * as React from "react"

import { PLATFORM_FORM_LANG } from "@/lib/platformLocale"
import { cn } from "@/lib/utils"

/** عناصر أصلية يفرض فيها المتصفح غالباً أرقام النظام — en-GB يضمن 0–9 + ميلادي */
const NATIVE_DATE_TIME_TYPES = new Set([
  "date",
  "datetime-local",
  "month",
  "week",
  "time",
])
const LATIN_DIGIT_INPUT_TYPES = new Set([...NATIVE_DATE_TIME_TYPES, "number", "tel"])

function resolveInputLang(type: string | undefined, lang: string | undefined): string | undefined {
  if (lang != null) return lang
  if (!type) return undefined
  if (NATIVE_DATE_TIME_TYPES.has(type)) return "en-GB"
  if (type === "number" || type === "tel") return PLATFORM_FORM_LANG
  return undefined
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, lang, ...props }, ref) => {
    const resolvedLang = resolveInputLang(type, lang)
    return (
      <input
        type={type}
        lang={resolvedLang}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          type && LATIN_DIGIT_INPUT_TYPES.has(type) ? "tabular-nums" : null,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
