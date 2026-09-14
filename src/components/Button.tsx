import type { ComponentPropsWithoutRef, ElementType } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "outline-white" | "green";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const variantClasses: Record<Variant, string> = {
  // Uses brand-cta/brand-cta-text rather than brand-gold/brand-ink directly -
  // for most palettes that's the same color, but it lets a palette whose
  // accent is too dark to pair with dark text (green & gray) give its
  // buttons their own readable, on-brand color instead.
  primary:
    "bg-brand-cta text-brand-cta-text hover:bg-brand-cta-dark shadow-sm shadow-brand-cta/30",
  secondary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-sm shadow-brand-blue/30",
  dark: "bg-brand-ink text-white hover:bg-black",
  ghost:
    "bg-transparent text-brand-ink border border-brand-border hover:border-brand-blue hover:text-brand-blue",
  "outline-white":
    "bg-transparent text-white border border-white/60 hover:border-white",
  // Fixed emerald green rather than a themed color - a deliberate one-off
  // accent (e.g. navbar "Get Started"), not something that should shift
  // when the palette switcher changes.
  green:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30",
};

export default function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = (as || "button") as any;
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
