import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../../components';

interface SignupSuccessModalProps {
    isOpen: boolean;
    onContinue: () => void;
}

export const SignupSuccessModal: React.FC<SignupSuccessModalProps> = ({ isOpen, onContinue }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
                        >
                            
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <Check className="w-10 h-10 text-green-600" />
                                </motion.div>
                            </div>

                            <h2 className="text-2xl font-bold text-navy-900 mb-3">Welcome Aboard!</h2>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                                Your account has been successfully created. You're all set to explore our global network.
                            </p>

                            <Button 
                                onClick={onContinue}
                                className="w-full py-3 text-base font-bold bg-navy-900 text-white rounded-xl hover:bg-navy-800 shadow-xl shadow-navy-200 group transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
