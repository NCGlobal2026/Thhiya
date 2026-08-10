import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Clock, WifiOff } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'rate-limit' | 'network';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
    // Convenience methods
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    rateLimit: (retryAfter?: number) => void;
    networkError: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast icons and colors by type - using Thhiya's navy theme colors
const toastConfig: Record<ToastType, {
    icon: typeof CheckCircle2;
    bgClass: string;
    borderClass: string;
    iconClass: string;
    titleClass: string;
    progressClass: string;
}> = {
    success: {
        icon: CheckCircle2,
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        iconClass: 'text-green-600',
        titleClass: 'text-green-900',
        progressClass: 'bg-green-500',
    },
    error: {
        icon: AlertCircle,
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        iconClass: 'text-red-500',
        titleClass: 'text-red-900',
        progressClass: 'bg-red-500',
    },
    warning: {
        icon: AlertTriangle,
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        iconClass: 'text-amber-600',
        titleClass: 'text-amber-900',
        progressClass: 'bg-amber-500',
    },
    info: {
        icon: Info,
        bgClass: 'bg-navy-50',
        borderClass: 'border-navy-200',
        iconClass: 'text-navy-600',
        titleClass: 'text-navy-900',
        progressClass: 'bg-navy-500',
    },
    'rate-limit': {
        icon: Clock,
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
        iconClass: 'text-orange-600',
        titleClass: 'text-orange-900',
        progressClass: 'bg-orange-500',
    },
    network: {
        icon: WifiOff,
        bgClass: 'bg-navy-50',
        borderClass: 'border-navy-200',
        iconClass: 'text-navy-500',
        titleClass: 'text-navy-900',
        progressClass: 'bg-navy-400',
    },
};

// Individual Toast component
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`
                relative flex items-start gap-3 p-3 xs:p-4 rounded-xl border shadow-lg backdrop-blur-sm
                ${config.bgClass} ${config.borderClass}
                w-[calc(100vw-2rem)] xs:w-auto xs:min-w-[300px] xs:max-w-[380px] sm:max-w-[420px]
            `}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${config.iconClass}`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
                <p className={`font-semibold text-sm leading-tight ${config.titleClass}`}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p className="text-xs xs:text-sm text-gray-600 mt-0.5 leading-snug">
                        {toast.message}
                    </p>
                )}
            </div>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Progress bar for auto-dismiss */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 right-0 h-1 ${config.progressClass} opacity-30 origin-left rounded-b-xl`}
                />
            )}
        </motion.div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const hideToast = useCallback((id: string) => {
        // Clear any existing timer
        const timer = toastTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            toastTimers.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = toast.duration ?? 5000; // Default 5 seconds

        const newToast: Toast = { ...toast, id, duration };

        setToasts((prev) => {
            // Limit to 3 toasts on mobile, 5 on desktop
            const maxToasts = window.innerWidth < 640 ? 3 : 5;
            const limited = prev.length >= maxToasts ? prev.slice(1) : prev;
            return [...limited, newToast];
        });

        // Auto-dismiss after duration
        if (duration > 0) {
            const timer = setTimeout(() => {
                hideToast(id);
            }, duration);
            toastTimers.current.set(id, timer);
        }
    }, [hideToast]);

    // Convenience methods
    const success = useCallback((title: string, message?: string) => {
        showToast({ type: 'success', title, message });
    }, [showToast]);

    const error = useCallback((title: string, message?: string) => {
        showToast({ type: 'error', title, message, duration: 7000 }); // Errors stay longer
    }, [showToast]);

    const warning = useCallback((title: string, message?: string) => {
        showToast({ type: 'warning', title, message });
    }, [showToast]);

    const info = useCallback((title: string, message?: string) => {
        showToast({ type: 'info', title, message });
    }, [showToast]);

    const rateLimit = useCallback((retryAfter?: number) => {
        const seconds = retryAfter || 60;
        showToast({
            type: 'rate-limit',
            title: 'Too many requests',
            message: `Please wait ${seconds} seconds before trying again.`,
            duration: 8000,
        });
    }, [showToast]);

    const networkError = useCallback(() => {
        showToast({
            type: 'network',
            title: 'Connection error',
            message: 'Please check your internet connection.',
            duration: 6000,
        });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast, success, error, warning, info, rateLimit, networkError }}>
            {children}

            {/* Toast container - responsive positioning */}
            <div className="fixed top-2 right-2 xs:top-4 xs:right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem toast={toast} onDismiss={hideToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Export a singleton for use outside React components (like axios interceptor)
let toastRef: ToastContextValue | null = null;

export const setToastRef = (ref: ToastContextValue | null) => {
    toastRef = ref;
};

export const getToastRef = () => toastRef;

export default ToastContext;
