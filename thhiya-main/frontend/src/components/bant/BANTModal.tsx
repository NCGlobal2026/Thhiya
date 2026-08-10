import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BANTForm } from './BANTForm';

interface BANTModalProps {
    isOpen: boolean;
    onClose: () => void;
    source?: string;
}

export const BANTModal: React.FC<BANTModalProps> = ({ isOpen, onClose, source = 'modal' }) => {
    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Use portal to render at body level, avoiding any parent overflow/z-index issues
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm"
                        style={{ zIndex: 9999 }}
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-4 sm:inset-6 md:inset-8 lg:inset-12 xl:inset-20 flex items-center justify-center"
                        style={{ zIndex: 10000 }}
                    >
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-full overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                                <BANTForm
                                    source={source}
                                    onClose={onClose}
                                    isModal={true}
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default BANTModal;
