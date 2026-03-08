//@ts-ignore
import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../shared/validateRequest';
import { AuthValidation } from './auth.validations';
import auth from '../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../middlewares/roles';
import rateLimit from 'express-rate-limit';
import { AUTH_RATE_LIMITS } from './auth.constants';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks (5 attempts per 15 minutes)
 */
const loginLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMITS.LOGIN.windowMs,
  max: AUTH_RATE_LIMITS.LOGIN.max,
  message: AUTH_RATE_LIMITS.LOGIN.message,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for registration endpoint
 * Prevents spam registrations (10 per hour)
 */
const registerLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMITS.REGISTER.windowMs,
  max: AUTH_RATE_LIMITS.REGISTER.max,
  message: AUTH_RATE_LIMITS.REGISTER.message,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for forgot password endpoint
 * Prevents email spam (3 per hour)
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMITS.FORGOT_PASSWORD.windowMs,
  max: AUTH_RATE_LIMITS.FORGOT_PASSWORD.max,
  message: AUTH_RATE_LIMITS.FORGOT_PASSWORD.message,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for verify email endpoint
 * Prevents verification spam (5 per hour)
 */
const verifyEmailLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMITS.VERIFY_EMAIL.windowMs,
  max: AUTH_RATE_LIMITS.VERIFY_EMAIL.max,
  message: AUTH_RATE_LIMITS.VERIFY_EMAIL.message,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general auth endpoints
 * 100 requests per minute
 */
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMITS.GENERAL.windowMs,
  max: AUTH_RATE_LIMITS.GENERAL.max,
  message: AUTH_RATE_LIMITS.GENERAL.message,
  standardHeaders: true,
  legacyHeaders: false,
});


//---------------------------------
// (Doctor | Patient) (Registration) | as doctor and patient need to provide their documents while registration
// TODO : validation add kora lagbe ..
//---------------------------------
router.post(
  '/register',
  registerLimiter,  // 🔒 Rate limiting: 10 per hour
  // validateRequest(AuthValidation.createHelpMessageValidationSchema),
  AuthController.register,
);

router.post(
  '/register/v2',
  registerLimiter,  // 🔒 Rate limiting: 10 per hour
  // validateRequest(AuthValidation.createHelpMessageValidationSchema),
  AuthController.registerV2,
);

router.post( // send fcm token for push notification ..
  '/login',
  loginLimiter,  // 🔒 Rate limiting: 5 attempts per 15 minutes
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post(
  '/login/v2',
  loginLimiter,  // 🔒 Rate limiting: 5 attempts per 15 minutes
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginV2,
);

// Route for Google login
router.post(
  '/google-login',
  loginLimiter,  // 🔒 Rate limiting: 5 attempts per 15 minutes
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLogin,
);

// 🆕
router.post(
  '/google-login/v2',
  loginLimiter,  // 🔒 Rate limiting: 5 attempts per 15 minutes
  // validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLoginV2,
);


router.post('/google', AuthController.googleAuthCallback);   // 🆕🆕🆕🆕🆕 client sends idToken
router.post('/apple', AuthController.appleAuthCallback); // 🆕🆕🆕🆕🆕🆕


//[🚧][🧑‍💻✅][🧪] // 🆗
router.post(
  '/forgot-password',
  forgotPasswordLimiter,  // 🔒 Rate limiting: 3 per hour
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post('/resend-otp', authLimiter);  // 🔒 Rate limiting: 100 per minute

//[🚧][🧑‍💻✅][🧪] // 🆗
router.post(
  '/reset-password',
  authLimiter,  // 🔒 Rate limiting: 100 per minute
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/change-password',
  auth(TRole.common),
  authLimiter,  // 🔒 Rate limiting: 100 per minute
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.post(
  '/verify-email',
  verifyEmailLimiter,  // 🔒 Rate limiting: 5 per hour
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail,
);

// ------ we remove all device for this user .. actually we remove all FCM tokens for this user -----
// this endpoint has some serious issue 
// TODO : NEED TO ADD ANOTHER API WITHOUT TOKEN ... 
// NEED TO STORE DEVICE ID .. 
router.get('/logout',
  //  auth(TRole.common),
  AuthController.logout);

router.post('/refresh-auth', AuthController.refreshToken);

export const AuthRoutes = router;
