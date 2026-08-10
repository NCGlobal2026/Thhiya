import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components';
import { X } from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { requestLoginOtp, resendOtp, verifyLoginOtp } from '../../services/authApi';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      if (!otpRequested) {
        await requestLoginOtp({ email, password });
        setOtpRequested(true);
        return;
      }

      const response = await verifyLoginOtp({ email, otp });
      if (!response?.success) {
        setError('Login failed. Please try again.');
        return;
      }

      login(response.token, {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        displayName:
          response.profile?.companyName ||
          response.profile?.contactPerson?.name ||
          response.profile?.firstName,
      }, response.profile || null);

      const redirectTo = (location.state as any)?.redirectTo;
      navigate(typeof redirectTo === 'string' ? redirectTo : '/');
    } catch (err: any) {
      const apiError = err.response?.data;
      if (typeof apiError?.attemptsLeft === 'number') {
        setError(`Invalid OTP. ${apiError.attemptsLeft} attempt(s) left.`);
      } else {
        setError(apiError?.error || err.message || 'Login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || isResendingOtp) return;
    setError('');
    setIsResendingOtp(true);
    try {
      await resendOtp({ email, purpose: 'login' });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to resend OTP.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-12 text-left">
        <h2 className="text-4xl font-black text-navy-900 mb-2 leading-tight">Welcome Back</h2>
        <p className="text-gray-400 font-semibold tracking-wide uppercase text-xs">Sign in to manage your thhiya network</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Business Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="you@company.com" />
        </div>
        {!otpRequested ? (
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="••••••••" />
          </div>
        ) : (
          <div className="space-y-1">
            <label htmlFor="otp" className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Email OTP</label>
            <input id="otp" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm tracking-[0.35em] font-bold text-center focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="123456" />
            <button type="button" disabled={isResendingOtp} onClick={handleResendOtp} className="text-xs font-bold text-red-600 hover:text-red-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {isResendingOtp ? 'Resending OTP...' : 'Resend OTP'}
            </button>
          </div>
        )}
        <div className="pt-2">
          <Button type="submit" className="w-full py-4 px-10 rounded-2xl bg-navy-950 text-white hover:bg-navy-900 shadow-xl shadow-navy-100 transition-all font-bold disabled:opacity-50" disabled={isLoading}>
            <span className="inline-flex items-center gap-2">
              {isLoading && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              {isLoading ? 'Authenticating...' : otpRequested ? 'Verify & Sign In' : 'Send Login OTP'}
            </span>
          </Button>
        </div>
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between gap-4 animate-in zoom-in-95">
            <span className="text-sm font-bold">{error}</span>
            <button type="button" onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}
      </form>
      <div className="mt-12 pt-8 border-t border-gray-100">
        <p className="text-gray-500 text-sm font-medium text-center">
          Don't have a partner account yet? <br className="sm:hidden" />
          <Link to="/signup" className="text-red-600 font-bold hover:underline">Register as a partner</Link>
        </p>
      </div>
    </AuthLayout>
  );
};
