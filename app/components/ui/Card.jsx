export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-3xl border border-emerald-100/80 bg-white/95 p-6 shadow-[0_10px_32px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
