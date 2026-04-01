"use client";

import { I18nProvider } from "@/app/i18n";

export default function AppProviders({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}
