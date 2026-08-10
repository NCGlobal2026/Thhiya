import { useEffect } from 'react';
import { useToast, setToastRef } from './ToastContext';

/**
 * Component that initializes the toast ref for use outside React components
 * (e.g., in axios interceptors). Must be rendered inside ToastProvider.
 */
export const ToastInitializer: React.FC = () => {
    const toast = useToast();

    useEffect(() => {
        setToastRef(toast);
        return () => setToastRef(null);
    }, [toast]);

    return null;
};

export default ToastInitializer;
