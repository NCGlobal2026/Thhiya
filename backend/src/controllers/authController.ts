import { Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import User, { UserRole } from "../models/User";
import VendorProfile from "../models/VendorProfile";
import UserProfile from "../models/UserProfile";
import ListingRequest from "../models/ListingRequest";
import AuthOtp from "../models/AuthOtp";
import emailService from "../services/emailService";
import { logger } from "../utils/logger";
import { z } from "zod";
import { sign, verify } from "hono/jwt";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-for-development-change-in-prod";
const COOKIE_NAME = "auth_token";
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

const signupVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
  website: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      return `https://${val}`;
    }
    return val;
  }, z.string().url()),
  contactName: z.string().min(1),
  contactRole: z.string().min(1),
  contactPhone: z.string().min(1),
  serviceCoverage: z
    .array(
      z.object({
        country: z.string(),
        services: z.array(z.string()),
      }),
    )
    .optional(),
  serviceMatrix: z
    .array(
      z.object({
        countries: z.array(z.string()),
        services: z.array(z.string()),
      }),
    )
    .optional(),
  questionnaireAnswers: z.record(z.string(), z.any()).optional(),
  answers: z.record(z.string(), z.any()).optional(),
  selectedPlan: z.string().optional(),
});

const signupUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["signup", "login"]),
});

const applyAuthCookie = async (c: Context, payload: any) => {
  const token = await sign(payload, JWT_SECRET);
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return token;
};

const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (
  email: string,
  otpCode: string,
  purpose: "signup" | "login",
) => {
  const subject =
    purpose === "signup"
      ? "Your Thhiya signup verification code"
      : "Your Thhiya login verification code";
  const actionLabel =
    purpose === "signup"
      ? "complete your account setup"
      : "complete your sign in";

  return emailService.sendEmail({
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verification Code</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f8ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f5f8ff;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe4f0;box-shadow:0 10px 30px rgba(15,30,61,0.08);">
                <tr>
                  <td style="padding:22px 26px;background:linear-gradient(135deg,#0f1e3d 0%,#1e3a5f 100%);">
                    <p style="margin:0 0 6px;color:rgba(255,255,255,.82);font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Secure Verification</p>
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">Confirm your email address</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px;">
                    <p style="margin:0 0 14px;color:#1e293b;font-size:14px;line-height:1.6;">Use this one-time verification code to ${actionLabel}.</p>
                    <div style="margin: 8px 0 16px; padding: 16px; background:#f8fbff; border:1px solid #e1eaf5; border-radius:10px; text-align:center;">
                      <span style="display:inline-block; color:#dc2626; font-size:34px; letter-spacing:10px; font-weight:700; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${otpCode}</span>
                    </div>
                    <p style="margin:0 0 10px;color:#475569;font-size:13px;">This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p>
                    <p style="margin:0;color:#64748b;font-size:12px;line-height:1.5;">If you did not request this email, you can safely ignore it.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Your Thhiya verification code is: ${otpCode}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
};

const createOtpRecord = async (params: {
  email: string;
  purpose: "signup" | "login";
  payload?: Record<string, any>;
}) => {
  const otpCode = generateOtpCode();
  const codeHash = await Bun.password.hash(otpCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await AuthOtp.deleteMany({
    email: params.email,
    purpose: params.purpose,
    usedAt: { $exists: false },
  });

  await AuthOtp.create({
    email: params.email,
    purpose: params.purpose,
    codeHash,
    expiresAt,
    payload: params.payload || {},
  });

  const emailResult = await sendOtpEmail(params.email, otpCode, params.purpose);
  if (!emailResult.success) {
    throw new Error(emailResult.error || "Failed to send OTP email");
  }
};

const getActiveOtp = async (email: string, purpose: "signup" | "login") => {
  return AuthOtp.findOne({
    email,
    purpose,
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

const buildAuthResponse = async (c: Context, user: any) => {
  let profile = null;
  if (user.role === UserRole.VENDOR && user.vendorProfileId) {
    profile = await VendorProfile.findById(user.vendorProfileId);
  } else if (user.role === UserRole.USER && user.userProfileId) {
    profile = await UserProfile.findById(user.userProfileId);
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    vendorProfileId: user.vendorProfileId,
    userProfileId: user.userProfileId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const token = await applyAuthCookie(c, payload);

  return c.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    },
    profile,
  });
};

export const requestSignupVendorOtp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = signupVendorSchema.parse(body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const passwordHash = await Bun.password.hash(validated.password);

    await createOtpRecord({
      email: validated.email,
      purpose: "signup",
      payload: {
        ...validated,
        passwordHash,
        password: undefined,
      },
    });

    return c.json({
      success: true,
      message: "OTP sent to your business email",
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    logger.error("Failed requesting vendor signup OTP", error as Error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const verifySignupVendorOtp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = otpVerifySchema.parse(body);

    const otpRecord = await getActiveOtp(validated.email, "signup");
    if (!otpRecord) {
      return c.json({ error: "OTP expired or not found" }, 400);
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return c.json(
        { error: "Too many invalid attempts. Request a new OTP." },
        429,
      );
    }

    const isValidOtp = await Bun.password.verify(
      validated.otp,
      otpRecord.codeHash,
    );
    if (!isValidOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const attemptsLeft = Math.max(
        0,
        otpRecord.maxAttempts - otpRecord.attempts,
      );
      return c.json({ error: "Invalid OTP", attemptsLeft }, 400);
    }

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const payload = otpRecord.payload || {};

    const user = new User({
      email: validated.email,
      passwordHash: payload.passwordHash,
      role: UserRole.VENDOR,
      isVerified: true,
    });
    await user.save();

    const normalizedCoverage = Array.isArray(payload.serviceCoverage)
      ? payload.serviceCoverage
      : Array.isArray(payload.serviceMatrix)
        ? payload.serviceMatrix.flatMap((row: any) =>
            (row.countries || []).map((country: string) => ({
              country,
              services: row.services || [],
            })),
          )
        : [];

    const vendorProfile = new VendorProfile({
      userId: user._id,
      companyName: payload.companyName,
      website: payload.website,
      contactPerson: {
        name: payload.contactName,
        role: payload.contactRole,
        phone: payload.contactPhone,
      },
      serviceCoverage: normalizedCoverage,
      questionnaireAnswers:
        payload.questionnaireAnswers || payload.answers || {},
      onboardingStatus: "submitted",
    });
    await vendorProfile.save();

    user.vendorProfileId = vendorProfile._id as any;
    await user.save();

    const listingRequest = await ListingRequest.create({
      userId: user._id,
      companyName: payload.companyName,
      website: payload.website,
      contactName: payload.contactName,
      contactRole: payload.contactRole,
      contactPhone: payload.contactPhone,
      email: validated.email,
      serviceMatrix: payload.serviceMatrix || [],
      answers: payload.answers || payload.questionnaireAnswers || {},
      selectedPlan: payload.selectedPlan || null,
      status: "pending",
    });

    try {
      await emailService.sendListingRequestAdminNotification({
        companyName: listingRequest.companyName,
        website: listingRequest.website,
        contactName: listingRequest.contactName,
        contactRole: listingRequest.contactRole,
        contactPhone: listingRequest.contactPhone || "",
        email: listingRequest.email,
        serviceMatrix: listingRequest.serviceMatrix.map((m: any) => ({
          countries: m.countries,
          services: m.services,
        })),
        answers: listingRequest.answers,
        selectedPlan: listingRequest.selectedPlan || null,
        submittedAt: listingRequest.submittedAt,
      });
    } catch (emailError) {
      logger.error(
        "Failed to send admin notifications for verified vendor signup",
        emailError as Error,
      );
    }

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    return buildAuthResponse(c, user);
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    logger.error("Failed verifying vendor signup OTP", error as Error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const requestLoginOtp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = loginSchema.parse(body);

    const user = await User.findOne({ email: validated.email });
    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const isValid = await Bun.password.verify(
      validated.password,
      user.passwordHash,
    );
    if (!isValid) return c.json({ error: "Invalid credentials" }, 401);

    await createOtpRecord({
      email: validated.email,
      purpose: "login",
      payload: { userId: String(user._id) },
    });

    return c.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    logger.error("Failed requesting login OTP", error as Error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const verifyLoginOtp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = otpVerifySchema.parse(body);

    const otpRecord = await getActiveOtp(validated.email, "login");
    if (!otpRecord) {
      return c.json({ error: "OTP expired or not found" }, 400);
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return c.json(
        { error: "Too many invalid attempts. Request a new OTP." },
        429,
      );
    }

    const isValidOtp = await Bun.password.verify(
      validated.otp,
      otpRecord.codeHash,
    );
    if (!isValidOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const attemptsLeft = Math.max(
        0,
        otpRecord.maxAttempts - otpRecord.attempts,
      );
      return c.json({ error: "Invalid OTP", attemptsLeft }, 400);
    }

    const user =
      (await User.findById(otpRecord.payload?.userId || null)) ||
      (await User.findOne({ email: validated.email }));
    if (!user)
      return c.json({ error: "Invalid login session. Please retry." }, 401);

    user.lastLogin = new Date();
    await user.save();

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    return buildAuthResponse(c, user);
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    logger.error("Failed verifying login OTP", error as Error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const resendOtp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = resendOtpSchema.parse(body);

    const currentOtp = await getActiveOtp(validated.email, validated.purpose);
    if (!currentOtp) {
      return c.json(
        { error: "No active OTP session found. Start again." },
        400,
      );
    }

    await createOtpRecord({
      email: validated.email,
      purpose: validated.purpose,
      payload: currentOtp.payload,
    });

    return c.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    logger.error("Failed resending OTP", error as Error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const signupVendor = async (c: Context) => {
  return requestSignupVendorOtp(c);
};

export const signupUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = signupUserSchema.parse(body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const passwordHash = await Bun.password.hash(validated.password);

    const user = new User({
      email: validated.email,
      passwordHash,
      role: UserRole.USER,
    });
    await user.save();

    const userProfile = new UserProfile({
      userId: user._id,
      firstName: validated.firstName,
      lastName: validated.lastName,
      phone: validated.phone,
      companyName: validated.companyName,
    });
    await userProfile.save();

    user.userProfileId = userProfile._id as any;
    await user.save();

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      userProfileId: user.userProfileId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    const token = await applyAuthCookie(c, payload);

    return c.json(
      {
        success: true,
        token,
        user: { id: user._id, email: user.email, role: user.role },
        userProfile,
      },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return c.json(
        { error: "Validation failed", details: error.flatten() },
        400,
      );
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const login = async (c: Context) => {
  return requestLoginOtp(c);
};

export const logout = async (c: Context) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  return c.json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (c: Context) => {
  try {
    const cookieToken = getCookie(c, COOKIE_NAME);
    const authHeader = c.req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = cookieToken || bearerToken;
    if (!token) return c.json({ authenticated: false }, 401);

    const payload = (await verify(token, JWT_SECRET, "HS256")) as any;

    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return c.json({ authenticated: false }, 401);

    let profile = null;
    if (user.role === UserRole.VENDOR && user.vendorProfileId) {
      profile = await VendorProfile.findById(user.vendorProfileId);
    } else if (user.role === UserRole.USER && user.userProfileId) {
      profile = await UserProfile.findById(user.userProfileId);
    }

    return c.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      profile,
    });
  } catch (err) {
    return c.json({ authenticated: false }, 401);
  }
};
