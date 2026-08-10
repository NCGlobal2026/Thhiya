import { Hono } from 'hono';
import * as authController from '../controllers/authController';

const auth = new Hono();

auth.post('/signup-vendor/request-otp', authController.requestSignupVendorOtp);
auth.post('/signup-vendor/verify-otp', authController.verifySignupVendorOtp);
auth.post('/login/request-otp', authController.requestLoginOtp);
auth.post('/login/verify-otp', authController.verifyLoginOtp);
auth.post('/resend-otp', authController.resendOtp);

auth.post('/signup-vendor', authController.signupVendor);
auth.post('/signup-user', authController.signupUser);
auth.post('/login', authController.login);
auth.post('/logout', authController.logout);
auth.get('/me', authController.checkAuth);

export default auth;
