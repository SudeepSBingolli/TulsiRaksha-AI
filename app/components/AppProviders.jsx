"use client";

import { I18nProvider } from "@/app/i18n";
import { EmotionProvider } from "@/context/emotionContext";

export default function AppProviders({ children }) {
  return (
    <I18nProvider>
      <EmotionProvider>{children}</EmotionProvider>
    </I18nProvider>
  );
}
