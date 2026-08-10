import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ChevronDown, ChevronRight, LineChart, FileText, Package, User, LogOut, Plus, Building2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { BrandMark } from "./BrandMark";
import { BANTModal } from "./bant";
import { NavMegaMenu, MegaMenuItem } from "./NavMegaMenu";
import { useAuth } from "../contexts/AuthContext";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleListBusinessClick = () => {
    const target = isAuthenticated ? '/request-listing' : '/signup';
    navigate(target, isAuthenticated ? undefined : { state: { source: 'header-list-business' } });
    setIsMenuOpen(false);
    setAvatarOpen(false);
  };

  // Derive initials from displayName or email
  const initials = (() => {
    const src = user?.displayName || user?.email || '?';
    const parts = src.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  })();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  // Close mobile menu + avatar dropdown on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setAvatarOpen(false);
  }, [location]);

  const navigation: Array<{
    name: string;
    to: string;
    brand?: boolean;
    badge?: string;
    type?: 'link' | 'mega-menu';
    items?: MegaMenuItem[];
  }> = [
      { name: "Overview", to: "/#home" },
      { name: "Purple Listings", to: "/purple-listings" },
      { name: "Pricing", to: "/pricing" },
      {
        name: "Resources",
        to: "#",
        type: 'mega-menu',
        items: [
          {
            name: "Insights",
            to: "/insights/hub",
            description: "Deep dive into market trends and analytics.",
            icon: LineChart
          },
          {
            name: "Blogs",
            to: "/blogs",
            description: "Latest articles, updates, and stories.",
            icon: FileText
          },
          {
            name: "GTM Toolkits",
            to: "/gtm-toolkits",
            description: "Essential tools and templates for growth.",
            icon: Package,
            badge: "Coming Soon"
          },
        ]
      },
      { name: "Why Thhiya", to: "/why-thhiya", brand: true },
    ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 xs:px-3 sm:px-6 md:px-8 lg:px-20 pt-2 xs:pt-3">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-7xl px-3 xs:px-4 sm:px-6 md:px-8 rounded-2xl xs:rounded-3xl lg:rounded-full border backdrop-blur-xl transition-all duration-300 relative ${isScrolled
          ? "bg-white/95 border-gray-200 shadow-xl"
          : "bg-white border-gray-200 shadow-lg"
          }`}
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="flex items-center justify-between py-2.5 xs:py-3 sm:py-3.5 xl:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <BrandMark
              variant="navy"
              className="text-xl xs:text-2xl sm:text-2xl tracking-tight transition-colors"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.type === 'mega-menu' ? (
                  <div
                    className="flex items-center gap-1 cursor-pointer font-medium text-sm xl:text-base text-navy-700 transition-colors hover:text-navy-900 py-2"
                    onMouseEnter={() => setActiveMegaMenu(item.name)}
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMegaMenu === item.name ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className="font-medium text-sm xl:text-base text-navy-700 transition-colors hover:text-navy-900 hover:underline relative inline-flex items-center gap-1.5 xl:gap-2 whitespace-nowrap group"
                    onMouseEnter={() => setActiveMegaMenu(null)}
                  >
                    {item.brand ? (
                      <span>
                        Why{" "}
                        <BrandMark
                          variant="navy"
                          className="inline text-sm xl:text-base align-baseline"
                          weight="semibold"
                        />
                      </span>
                    ) : item.badge ? (
                      <span className="relative">
                        {item.name}
                        <span className="absolute -top-2.5 -right-2 text-[8px] font-bold bg-red-500 text-white px-1 py-px rounded leading-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Soon
                        </span>
                      </span>
                    ) : (
                      item.name
                    )}
                  </Link>
                )}

                {/* Mega Menu Dropdown */}
                {item.type === 'mega-menu' && item.items && (
                  <NavMegaMenu
                    isOpen={activeMegaMenu === item.name}
                    items={item.items}
                    onClose={() => setActiveMegaMenu(null)}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA Buttons — auth-aware */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {isAuthenticated ? (
              // ── Authenticated: List Your Business + avatar chip + dropdown ─
              <>
                <Button onClick={handleListBusinessClick} variant="ghost" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 text-sm flex items-center gap-1.5 shadow-sm transition-colors border">
                  <Building2 className="w-4 h-4" />
                  List My Business
                </Button>
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-navy-800 max-w-[120px] truncate">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${avatarOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-xs font-bold text-navy-900 truncate">{user?.displayName || 'Your Account'}</p>
                          <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setAvatarOpen(false); navigate('/profile'); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            My Profile
                          </button>
                          <button
                            onClick={handleListBusinessClick}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                            List My Business
                          </button>
                          <div className="my-1 border-t border-gray-100" />
                          <button
                            onClick={() => { logout(); navigate('/'); setAvatarOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // ── Guest: Sign In + List Your Business + Get Matched ────────
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-navy-800 hover:bg-navy-50 text-sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="ghost" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 text-sm flex items-center gap-1.5 shadow-sm transition-colors border">
                    <Building2 className="w-4 h-4" />
                    List My Business
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="text-sm bg-red-600 hover:bg-red-500 flex items-center gap-1.5"
                  onClick={() => setIsBANTModalOpen(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Matched
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden inline-flex h-9 w-9 xs:h-10 xs:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-navy-900 shadow-sm transition-all duration-300 hover:border-gray-300 z-50 shrink-0"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? (
              <X className="w-4 h-4 xs:w-5 xs:h-5" />
            ) : (
              <Menu className="w-4 h-4 xs:w-5 xs:h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              id="mobile-nav"
              className="lg:hidden overflow-hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl transition-colors rounded-b-2xl xs:rounded-b-3xl"
            >
              <div className="px-3 xs:px-4 sm:px-6 py-4 space-y-3 xs:space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.type === 'mega-menu' ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                          className="flex items-center justify-between w-full font-medium text-sm xs:text-base text-navy-700 hover:text-navy-900 py-2"
                        >
                          <span className="flex items-center gap-2">{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.name ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4 border-l-2 border-slate-100 ml-1 space-y-3"
                            >
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.to}
                                  className="flex items-center gap-3 py-2 text-sm text-navy-600 hover:text-red-600"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <subItem.icon className="w-4 h-4 opacity-70" />
                                  <span>{subItem.name}</span>
                                  {subItem.badge && (
                                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.to}
                        className="flex items-center justify-between font-medium text-sm xs:text-base text-navy-700 transition-colors hover:text-navy-900 group/mobile py-2 xs:py-2.5"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          {item.brand ? (
                            <span>
                              Why{" "}
                              <BrandMark
                                variant="navy"
                                className="inline text-sm xs:text-base align-baseline"
                                weight="semibold"
                              />
                            </span>
                          ) : item.badge ? (
                            <span className="inline-flex items-center gap-2">
                              {item.name}
                              <span className="text-[10px] xs:text-xs font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                {item.badge}
                              </span>
                            </span>
                          ) : (
                            item.name
                          )}
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-3 xs:pt-4 space-y-2 xs:space-y-3 border-t border-gray-200">
                  {isAuthenticated ? (
                    // ── Authenticated mobile actions ─────────────────────
                    <>
                      <div className="flex items-center gap-3 px-1 py-2">
                        <div className="w-9 h-9 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-navy-900 truncate">{user?.displayName || 'Your Account'}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full text-navy-800 hover:bg-navy-50 text-sm flex items-center gap-2">
                          <User className="w-4 h-4" /> My Profile
                        </Button>
                      </Link>
                      <Button onClick={handleListBusinessClick} size="sm" className="w-full text-sm bg-red-600 hover:bg-red-500 flex items-center justify-center gap-1.5">
                        <Plus className="w-4 h-4" /> List My Business
                      </Button>
                      <button
                        onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    // ── Guest mobile actions ──────────────────────────────
                    <>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full text-navy-800 hover:bg-navy-50 text-sm">Sign In</Button>
                      </Link>
                      <Button onClick={handleListBusinessClick} variant="ghost" size="sm" className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 border text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                        <Building2 className="w-4 h-4" /> List My Business
                      </Button>
                      <Button
                        size="sm"
                        className="w-full text-sm bg-red-600 hover:bg-red-500 flex items-center justify-center gap-1.5"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsBANTModalOpen(true);
                        }}
                      >
                        <Sparkles className="w-4 h-4" /> Get Matched
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* BANT/MEDDIC/INTENT(BMI) Modal - rendered outside nav to avoid z-index/overflow issues */}
      <BANTModal
        isOpen={isBANTModalOpen}
        onClose={() => setIsBANTModalOpen(false)}
        source="header"
      />
    </header>
  );
};
