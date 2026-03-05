//@ts-ignore
import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../shared/validateRequest';
import { AuthValidation } from './auth.validations';
import auth from '../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();


//---------------------------------
// (Doctor | Patient) (Registration) | as doctor and patient need to provide their documents while registration
// TODO : validation add kora lagbe .. 
//---------------------------------
router.post(
  '/register',
  // validateRequest(AuthValidation.createHelpMessageValidationSchema),
  AuthController.register,
);

router.post(
  '/register/v2',
  // validateRequest(AuthValidation.createHelpMessageValidationSchema),
  AuthController.registerV2,
);

router.post( // send fcm token for push notification .. 
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post(
  '/login/v2',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginV2,
);

// Route for Google login
router.post(
  '/google-login',
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLogin,
);

// 🆕
router.post(
  '/google-login/v2',
  // validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLoginV2,
);


router.post('/google', AuthController.googleAuthCallback);   // 🆕🆕🆕🆕🆕 client sends idToken
router.post('/apple', AuthController.appleAuthCallback); // 🆕🆕🆕🆕🆕🆕


//[🚧][🧑‍💻✅][🧪] // 🆗 
router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post('/resend-otp', AuthController.resendOtp);

//[🚧][🧑‍💻✅][🧪] // 🆗 
router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/change-password',
  auth(TRole.common),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

//[🚧][🧑‍💻✅][🧪] // 🆗 
router.post(
  '/verify-email',
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
