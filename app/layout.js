import "./globals.css";
import AppProviders from "./components/AppProviders";

export const metadata = {
  title: "TulsiRaksha AI — Never Alone. Always Cared For.",
  description:
    "AI-powered elderly care companion for senior citizens in India. Voice-first, elder-friendly, and built with love.",
  keywords: "elderly care, AI companion, India, senior citizens, health tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F9FAF5] text-gray-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}