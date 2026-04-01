import Link from "next/link";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS = {
  primary:
    "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.26)] hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_16px_35px_rgba(16,185,129,0.3)]",
  secondary:
    "bg-white text-emerald-700 border border-emerald-200 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
  ghost:
    "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const style = `${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={style} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={style} {...props}>
      {children}
    </button>
  );
}
