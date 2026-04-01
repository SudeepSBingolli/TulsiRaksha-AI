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
    <footer className="relative border-t border-gray-100 bg-white/50 pb-32 sm:pb-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <span className="text-lg">🌿</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Tulsi<span className="text-emerald-600">Raksha</span>
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <span className="text-xs font-medium text-gray-300 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                Next.js 15
              </span>
              <span className="text-xs font-medium text-gray-300 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                Tailwind CSS
              </span>
              <span className="text-xs font-medium text-gray-300 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                AI/ML
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.features")}
            </h4>
            <ul className="space-y-3">
              {featureLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-gray-400 hover:text-emerald-600 transition-colors"
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
                    className="text-sm sm:text-base text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.emergency")}
            </h4>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <p className="text-2xl font-bold text-red-600 mb-1">112</p>
              <p className="text-sm text-red-500 font-medium">
                {t("footer.emergencyNumberLabel")}
              </p>
              <button className="mt-3 w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-200/50">
                {t("footer.emergencyButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300">
            {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">{t("footer.madeWith")}</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span className="text-xs text-gray-300">{t("footer.forElders")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}