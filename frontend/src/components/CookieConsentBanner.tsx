import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, BarChart3, Megaphone, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useCookieConsent, CookiePreferences } from "../hooks/useCookieConsent";
import { reinitializeGA } from "../services/analytics";

export const CookieConsentBanner: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, savePreferences, preferences } =
    useCookieConsent();

  const [showCustomize, setShowCustomize] = useState(false);
  const [customPrefs, setCustomPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  // All hooks must be called before any early returns
  const handleAcceptAll = useCallback(() => {
    acceptAll();
    // Initialize GA after accepting analytics cookies
    setTimeout(() => reinitializeGA(), 100);
  }, [acceptAll]);

  const handleCustomize = useCallback(() => {
    setCustomPrefs({ ...preferences });
    setShowCustomize(true);
  }, [preferences]);

  const handleSaveCustom = useCallback(() => {
    savePreferences(customPrefs);
    setShowCustomize(false);
    // Initialize GA if analytics was enabled
    if (customPrefs.analytics) {
      setTimeout(() => reinitializeGA(), 100);
    }
  }, [customPrefs, savePreferences]);

  const togglePreference = useCallback((key: keyof CookiePreferences) => {
    if (key === "essential") return; // Can't toggle essential
    setCustomPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Early return AFTER all hooks
  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Main Banner */}
          {!showCustomize && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
            >
            <div className="relative bg-[#1f2f3e] rounded-xl border border-white/10 shadow-lg py-2 pl-4 pr-10 flex flex-col sm:flex-row items-center gap-3 max-w-2xl w-full mx-4">
                {/* Close Button */}
                <button
                    onClick={() => {
                        // Just close visual without accepting/rejecting if user clicks X? 
                        // Or should it be 'reject'? Usually X means 'dismiss'
                        // For now we just hide it or we can treat as reject visually?
                        // The user said "remove Reject All button", but usually X implies dismiss.
                        // I'll wire it to simply close/hide the banner via state if I had it, but here I'll wire to rejectAll for safety or just hide? 
                        // Typically cookie banners persist unless action is taken.
                        // BUT user just asked for "Cross button".
                        // I will wire it to 'rejectAll' as that is the closest safe 'dismiss'.
                        rejectAll(); 
                    }}
                    className="absolute top-2.5 right-2.5 p-1 bg-[#1f2f3e] rounded-lg text-white/40 hover:text-white hover:bg-[#2b3c4f] transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>

                {/* Icon and Text */}
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <h3 className="text-white font-medium text-sm leading-tight">
                      We value your privacy
                    </h3>
                    <div className="flex flex-col">
                      <p className="text-white/60 text-xs leading-tight">
                        We use cookies to enhance your experience.
                      </p>
                      <Link
                        to="/cookie-policy"
                        className="text-white/80 hover:text-white underline transition-colors text-xs"
                      >
                        Read our Cookie Policy
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCustomize}
                    className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-all"
                  >
                    Customize
                  </button>
                  <button
                    id="cookie-accept-all"
                    onClick={handleAcceptAll}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-lg shadow-red-600/20"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customize Modal */}
          {showCustomize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCustomize(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-navy-950 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-4 mb-6">
                  {/* Essential */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-600/50 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Essential</p>
                        <p className="text-white/60 text-sm">
                          Required for the site to work
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 text-xs font-medium text-green-400 bg-green-500/20 rounded-full">
                      Always On
                    </div>
                  </div>

                  {/* Analytics */}
                  <div
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => togglePreference("analytics")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-600/50 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Analytics</p>
                        <p className="text-white/60 text-sm">
                          Help us improve the experience
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-7 rounded-full flex items-center transition-colors ${
                        customPrefs.analytics ? "bg-red-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          customPrefs.analytics
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Marketing */}
                  <div
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => togglePreference("marketing")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-600/50 flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Marketing</p>
                        <p className="text-white/60 text-sm">
                          Personalized ads and content
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-7 rounded-full flex items-center transition-colors ${
                        customPrefs.marketing ? "bg-red-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          customPrefs.marketing
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustom}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
