import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
    User, Mail, Building2, Globe, Phone, Shield, LogOut,
    CheckCircle2, Clock, XCircle, ArrowRight, Edit3,
    Save, X, Sparkles, AlertTriangle, ChevronRight, BadgeCheck
} from 'lucide-react';
import { listingsApi } from '../services/api';

interface ListingRequest {
    _id: string;
    companyName: string;
    website: string;
    contactName: string;
    contactRole: string;
    contactPhone?: string;
    email: string;
    serviceMatrix: { countries: string[]; services: string[] }[];
    selectedPlan?: string | null;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    approvedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string, email?: string): string => {
    if (name) {
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'ME';
};

// ─── Listing Status Badge ─────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: ListingRequest['status'] }> = ({ status }) => {
    const map = {
        pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending Review' },
        approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
        rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
    };
    const cfg = map[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout, updateProfile, vendorProfile } = useAuth();

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated) navigate('/login');
    }, [isLoading, isAuthenticated, navigate]);

    const [listingRequest, setListingRequest] = useState<ListingRequest | null>(null);
    const [listingLoading, setListingLoading] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user?.displayName || '');
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    useEffect(() => {
        if (!isAuthenticated) return;
        setListingLoading(true);
        listingsApi.getMyRequest()
            .then((response) => {
                setListingRequest(response?.data || null);
            })
            .catch(() => {
                setListingRequest(null);
            })
            .finally(() => {
                setListingLoading(false);
            });
    }, [isAuthenticated]);

    // Sync name input when user loads
    useEffect(() => {
        if (user?.displayName) setNameInput(user.displayName);
    }, [user?.displayName]);

    const saveName = () => {
        if (nameInput.trim() && updateProfile) {
            updateProfile({ displayName: nameInput.trim() });
        }
        setEditingName(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const initials = getInitials(user.displayName, user.email);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Hero */}
            <section className={`pt-36 pb-10 px-4 text-white relative overflow-hidden
                ${(vendorProfile as any)?.plan === 'Free Listing' || !(vendorProfile as any)?.plan
                    ? 'bg-navy-900 border-b border-navy-800'
                    : 'bg-gradient-to-br from-navy-900 via-navy-800 to-red-900 shadow-2xl shadow-red-900/20'
                }`}
            >
                {/* Subtle background glow for premium users */}
                {((vendorProfile as any)?.plan && (vendorProfile as any)?.plan !== 'Free Listing') && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                )}

                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-5 relative z-10">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-2xl border-4 shrink-0
                            ${(vendorProfile as any)?.plan === 'Free Listing' || !(vendorProfile as any)?.plan
                                ? 'bg-navy-600 border-navy-400'
                                : 'bg-gradient-to-br from-red-500 to-red-700 border-white/20'
                            }`}
                    >
                        {initials}
                    </motion.div>
                    <div className="flex-1 text-center sm:text-left">
                        {editingName ? (
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <input
                                    value={nameInput}
                                    onChange={e => setNameInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                                    className="bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-white text-xl font-bold placeholder-white/40 outline-none focus:ring-2 focus:ring-white/40"
                                    placeholder="Your display name"
                                    autoFocus
                                />
                                <button onClick={saveName} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Save className="w-4 h-4" /></button>
                                <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                                <div className="flex items-center gap-2 justify-center">
                                    <h1 className="text-2xl font-black">{user.displayName || user.email.split('@')[0]}</h1>
                                    <button onClick={() => setEditingName(true)} className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Plan Badge */}
                                {(vendorProfile as any)?.plan && (
                                    <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 mx-auto sm:mx-0
                                        ${(vendorProfile as any)?.plan === 'Free Listing'
                                            ? 'bg-navy-800 text-navy-200 border border-navy-700'
                                            : (vendorProfile as any)?.plan === 'Pro' || (vendorProfile as any)?.plan === 'Enterprise'
                                                ? 'bg-yellow-500 text-navy-900 shadow-md shadow-yellow-500/20'
                                                : 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                        }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {(vendorProfile as any).plan} Vendor
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-navy-200 text-sm mt-0.5">{user.email}</p>
                        <p className="text-xs text-navy-300 mt-1 capitalize">
                            <Shield className="inline w-3 h-3 mr-1 opacity-70" />{user.role} Account
                        </p>
                    </div>
                    {/* Logout */}
                    <button
                        onClick={() => setLogoutConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors shrink-0 mt-4 sm:mt-0"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </section>

            {/* Content */}
            <div className="flex-1 py-8 px-4">
                <div className="max-w-3xl mx-auto space-y-5">

                    {/* ── Account Info ────────────────────────────────────────── */}
                    <Card title="Account" icon={<User className="w-4 h-4 text-red-500" />}>
                        <Row label="Email"><span className="font-medium text-navy-900">{user.email}</span></Row>
                        <Row label="Role"><span className="capitalize font-medium text-navy-900">{user.role}</span></Row>
                        <Row label="Display Name">
                            {editingName ? (
                                <span className="text-gray-400 text-sm">Editing above…</span>
                            ) : (
                                <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-navy-900 font-medium hover:text-red-600 transition-colors">
                                    {user.displayName || <span className="text-gray-400">Not set</span>}
                                    <Edit3 className="w-3 h-3 text-gray-400" />
                                </button>
                            )}
                        </Row>
                    </Card>

                    {/* ── Vendor Details ──────────────────────────────────────── */}
                    {vendorProfile && (
                        <Card title="Business Details" icon={<Building2 className="w-4 h-4 text-red-500" />}>
                            {vendorProfile.companyName && <Row label="Company"><span className="font-medium text-navy-900">{vendorProfile.companyName}</span></Row>}
                            {vendorProfile.website && (
                                <Row label="Website">
                                    <a href={vendorProfile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-red-600 hover:underline font-medium">
                                        <Globe className="w-3.5 h-3.5" />{vendorProfile.website}
                                    </a>
                                </Row>
                            )}
                            {vendorProfile.contactPhone && (
                                <Row label="Phone">
                                    <span className="flex items-center gap-1 font-medium text-navy-900"><Phone className="w-3.5 h-3.5 text-gray-400" />{vendorProfile.contactPhone}</span>
                                </Row>
                            )}
                        </Card>
                    )}

                    {/* ── Listing Request Status ──────────────────────────────── */}
                    {listingLoading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : listingRequest ? (
                        <Card
                            title="Listing Request"
                            icon={<Building2 className="w-4 h-4 text-red-500" />}
                            badge={<StatusBadge status={listingRequest.status} />}
                        >
                            <Row label="Company"><span className="font-medium text-navy-900">{listingRequest.companyName}</span></Row>
                            <Row label="Website">
                                <a href={listingRequest.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5" />{listingRequest.website}
                                </a>
                            </Row>
                            <Row label="Submitted"><span className="font-medium text-navy-900">{new Date(listingRequest.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></Row>
                            {listingRequest.approvedAt && (
                                <Row label="Approved"><span className="font-medium text-green-700">{new Date(listingRequest.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></Row>
                            )}
                            {listingRequest.selectedPlan && (
                                <Row label="Selected Plan"><span className="font-medium text-navy-900">{listingRequest.selectedPlan}</span></Row>
                            )}
                            <Row label="Services">
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(new Set((listingRequest.serviceMatrix || []).flatMap((m) => m.services))).slice(0, 4).map(s => (
                                        <span key={s} className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 text-xs font-semibold border border-navy-100">{s}</span>
                                    ))}
                                    {Array.from(new Set((listingRequest.serviceMatrix || []).flatMap((m) => m.services))).length > 4 && (
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">+{Array.from(new Set((listingRequest.serviceMatrix || []).flatMap((m) => m.services))).length - 4} more</span>
                                    )}
                                </div>
                            </Row>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                                {listingRequest.status === 'approved' ? (
                                    <button
                                        onClick={() => navigate('/purple-listings')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors"
                                    >
                                        <BadgeCheck className="w-4 h-4" /> View Live Listing <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing', { state: { selectedPlan: listingRequest.selectedPlan || undefined, mode: 'update' } })}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-navy-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        <Sparkles className="w-4 h-4" /> Update Plan Selection
                                    </button>
                                )}
                            </div>

                            {listingRequest.status === 'pending' && (
                                <p className="text-xs text-gray-400 mt-2 text-center">Your listing is pending manual admin approval.</p>
                            )}
                        </Card>
                    ) : (
                        /* ── No listing request yet ── */
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="font-bold text-navy-900 mb-1">No Listing Request Yet</p>
                            <p className="text-sm text-gray-500 mb-4">List your business on the Thhiya directory to reach global buyers.</p>
                            <button
                                onClick={() => navigate('/request-listing')}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors"
                            >
                                <Building2 className="w-4 h-4" /> Request a Listing <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── Plan / Subscription ─────────────────────────────────── */}
                    {(vendorProfile as any)?.plan && (
                        <Card
                            title="Current Plan"
                            icon={<Sparkles className={`w-4 h-4 ${(vendorProfile as any)?.plan === 'Free Listing' ? 'text-navy-500' : 'text-yellow-500'}`} />}
                        >
                            <Row label="Plan">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize
                                    ${(vendorProfile as any)?.plan === 'Free Listing'
                                        ? 'bg-navy-50 text-navy-700 border-navy-200'
                                        : (vendorProfile as any)?.plan === 'Pro' || (vendorProfile as any)?.plan === 'Enterprise'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-red-100 text-red-700 border-red-200'
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3" />{(vendorProfile as any).plan}
                                </span>
                            </Row>

                            {(vendorProfile as any)?.plan === 'Free Listing' ? (
                                <div className="mt-4 p-4 bg-navy-50 rounded-xl border border-navy-100 text-sm">
                                    <p className="font-semibold text-navy-900 mb-1">Upgrade your visibility</p>
                                    <p className="text-navy-600 mb-3">Get exclusive BANT/MEDDIC/INTENT(BMI)-qualified leads and stand out on the Purple Listing page with a premium plan.</p>
                                    <button onClick={() => navigate('/pricing')} className="text-red-600 font-bold hover:text-red-700 flex items-center gap-1 transition-colors">
                                        View Paid Plans <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-xl border border-yellow-500/20 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-yellow-500 text-white rounded-full shrink-0 mt-0.5">
                                            <BadgeCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-900 mb-1">Premium Benefits Active</p>
                                            <p className="text-navy-700">Your profile is highlighted in the directory and you are receiving priority support. Lead flow is unrestricted.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                </div>
            </div>

            {/* ── Logout Confirm Modal ─────────────────────────────────────── */}
            {logoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
                    >
                        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-navy-900 mb-1">Sign out?</h3>
                        <p className="text-sm text-gray-500 mb-6">You'll need to sign in again to access your account.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-navy-700 font-semibold hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    );
};

// ─── Small helpers ────────────────────────────────────────────────────────────
const Card: React.FC<{ title: string; icon: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, badge, children }) => (
    <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            {icon}
            <h2 className="text-sm font-black text-navy-900">{title}</h2>
            {badge && <div className="ml-auto">{badge}</div>}
        </div>
        <div className="p-5 space-y-3">{children}</div>
    </motion.section>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-start justify-between gap-4 text-sm">
        <span className="text-gray-400 shrink-0 w-28">{label}</span>
        <div className="text-right">{children}</div>
    </div>
);
