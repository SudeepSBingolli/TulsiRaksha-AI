"use client";

import { useI18n } from "@/app/i18n";

export default function Footer() {
  const { t } = useI18n();

  const featureLinks = [
    t("footer.featureVoice"),
    t("footer.featureMedicine"),
    t("footer.featureTracking"),
    t("footer.featureFamily"),
    t("footer.featureSos"),
  ];

  const supportLinks = [
    t("footer.supportHelp"),
    t("footer.supportContact"),
    t("footer.supportPrivacy"),
    t("footer.supportTerms"),
    t("footer.supportAccess"),
  ];

  return (
    <footer className="relative border-t border-emerald-100 bg-gradient-to-b from-white/80 to-emerald-50/30 pb-32 sm:pb-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <span className="text-lg">🌿</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Tulsi<span className="text-emerald-600">Raksha</span>
              </span>
            </div>

            <p className="text-base text-gray-600 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>

            <div className="flex items-center gap-3 mt-5">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                Next.js 16
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                Tailwind CSS
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                AI/ML
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.features")}
            </h4>
            <ul className="space-y-3">
              {featureLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-base text-gray-600 hover:text-emerald-700 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-base text-gray-600 hover:text-emerald-700 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.emergency")}
            </h4>
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-[0_10px_24px_rgba(16,185,129,0.08)]">
              <p className="text-2xl font-bold text-red-600 mb-1">112</p>
              <p className="text-sm text-gray-600 mb-3">{t("footer.emergencyNumberLabel")}</p>
              <button
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold py-3 transition-all duration-300 hover:shadow-lg"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "tel:112";
                  }
                }}
              >
                {t("footer.emergencyButton")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">{t("footer.rights")}</p>
          <p className="text-sm text-gray-600">
            {t("footer.madeWith")} <span className="text-red-500">♥</span> {t("footer.forElders")}
          </p>
        </div>
      </div>
    </footer>
  );
}
