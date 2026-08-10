import { api } from './api';

export const requestVendorSignupOtp = async (data: any) => {
    const response = await api.post('/auth/signup-vendor/request-otp', data);
    return response.data;
};

export const verifyVendorSignupOtp = async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/signup-vendor/verify-otp', data);
    return response.data;
};

export const requestLoginOtp = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login/request-otp', credentials);
    return response.data;
};

export const verifyLoginOtp = async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/login/verify-otp', data);
    return response.data;
};

export const resendOtp = async (data: { email: string; purpose: 'signup' | 'login' }) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
};

export const logoutFromBackend = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getCurrentAuth = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
