//@ts-ignore
import moment from 'moment';
//@ts-ignore
import mongoose from "mongoose";
import ApiError from '../../errors/ApiError';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import eventEmitterForOTPCreateAndSendMail, { OtpService } from '../otp/otp.service';
//@ts-ignore
import bcryptjs from 'bcryptjs';
import { config } from '../../config';
import { TokenService } from '../token/token.service';
import { TokenType } from '../token/token.interface';
import { OtpType } from '../otp/otp.interface';
//@ts-ignore
import { OAuth2Client } from 'google-auth-library';
//@ts-ignore
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//@ts-ignore
import appleSignin from 'apple-signin-auth';
//@ts-ignore
import jwt, { Secret } from 'jsonwebtoken';

//@ts-ignore
import EventEmitter from 'events';
import { enqueueWebNotification } from '../../services/notification.service';
import { TRole } from '../../middlewares/roles';
import { TNotificationType } from '../notification/notification.constants';
import { UserProfile } from '../user.module/userProfile/userProfile.model';
import { User } from '../user.module/user/user.model';
import { UserDevices } from '../user.module/userDevices/userDevices.model';
import { IUserDevices } from '../user.module/userDevices/userDevices.interface';
import { UserRoleDataService } from '../user.module/userRoleData/userRoleData.service';
import { IUser } from '../user.module/user/user.interface';
import { ICreateUser, IGoogleLoginPayload } from './auth.interface';
import { OAuthAccount } from '../user.module/oauthAccount/oauthAccount.model';
import { TAuthProvider } from './auth.constants';
import { redisClient } from '../../helpers/redis/redis';
import { logger, errorLogger } from '../../shared/logger';
import { AUTH_SESSION_CONFIG } from './auth.constants';
const eventEmitterForUpdateUserProfile = new EventEmitter(); // functional way
const eventEmitterForCreateWallet = new EventEmitter();


let userRoleDataService = new UserRoleDataService();

eventEmitterForUpdateUserProfile.on('eventEmitterForUpdateUserProfile', async (valueFromRequest: any) => {
  try {
      const { userProfileId, userId } = valueFromRequest;
      await UserProfile.findByIdAndUpdate(userProfileId, { userId });
    }catch (error) {
      console.error('Error occurred while handling token creation and deletion:', error);
    }
});

export default eventEmitterForUpdateUserProfile;


eventEmitterForCreateWallet.on('eventEmitterForCreateWallet', async (valueFromRequest: any) => {
  try {
      const { userId } = valueFromRequest;
      
    }catch (error) {
      console.error('Error occurred while handling token creation and deletion:', error);
    }
});

const validateUserStatus = (user: IUser) => {
  if (user.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted. Please contact support',
    );
  }
};

// 💎✨🔍 -> V2 Found
const createUser = async (userData: ICreateUser, userProfileId:string) => {
  
  const existingUser = await User.findOne({ email: userData.email });
  
  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
    } else {
      await User.findOneAndUpdate({ email: userData.email }, userData);

      //create verification email token
      const verificationToken =
        await TokenService.createVerifyEmailToken(existingUser);
      //create verification email otp
      await OtpService.createVerificationEmailOtp(existingUser.email);
      return { verificationToken };
    }
  }

  userData.password = await bcryptjs.hash(userData.password, 12);

  const user = await User.create(userData);


  // 📈⚙️ OPTIMIZATION: with event emmiter 
  eventEmitterForUpdateUserProfile.emit('eventEmitterForUpdateUserProfile', { 
    userProfileId,
    userId : user._id
  });

  const [verificationToken, otp] = await Promise.all([
      TokenService.createVerifyEmailToken(user),
      OtpService.createVerificationEmailOtp(user.email)
  ]);


  // eventEmitterForOTPCreateAndSendMail.emit('eventEmitterForOTPCreateAndSendMail', { email: user.email });

  return { user, verificationToken , otp  }; // FIXME  : otp remove korte hobe ekhan theke .. 
};

 /*-─────────────────────────────────
  |  
  └──────────────────────────────────*/
  /*-------------------------------

  1. check for user object by email
      |-> if user exist.. check for isEmailVerified
      |-> if not verified .. send otp and verification token
  2. hash the given password
  3. create the User
  4. use eventEmitter to add userProfileId to User Table [🎯Optimized]

  5. if not patient 
      |-> use eventEmitter to create wallet
      |-> send notification to admin
      |-> return user

  6.  if patient [🐛]
      |->  create verificationEmailToken(createdUser)
      |-> create otp and send mail by eventEmitter 
          [🎯Optimized]
      |-> return user

  ---------------------------------*/
const createUserV2 = async (userData: ICreateUser, userProfileId:string) => {
  
  const existingUser = await User.findOne({ email: userData.email });
  
  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
    } else {
      await User.findOneAndUpdate({ email: userData.email }, userData);

      //create verification email token
      const verificationToken =
        await TokenService.createVerifyEmailToken(existingUser);
      //create verification email otp
      await OtpService.createVerificationEmailOtp(existingUser.email);
      return { verificationToken };
    }
  }

  userData.password = await bcryptjs.hash(userData.password, 12);

  const user = await User.create(userData);

  /*-─────────────────────────────────
  | TODO : use redis bullmq 
  └──────────────────────────────────*/
  // 📈⚙️ OPTIMIZATION: with event emmiter 
  eventEmitterForUpdateUserProfile.emit('eventEmitterForUpdateUserProfile', { 
    userProfileId,
    userId : user._id
  });

  const [verificationToken, otp] = await Promise.all([
      TokenService.createVerifyEmailToken(user),
      OtpService.createVerificationEmailOtp(user.email)
  ]);


  // eventEmitterForOTPCreateAndSendMail.emit('eventEmitterForOTPCreateAndSendMail', { email: user.email });

  return { user, verificationToken , otp  }; // FIXME  : otp remove korte hobe ekhan theke .. 
};

// local login // 💎✨🔍 -> V2 Found
const login = async (email: string, 
  reqpassword: string,
  fcmToken? : string,
  deviceInfo?: { deviceType?: string, deviceName?: string }
) => {
  const user:IUser = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.isDeleted == true) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your account is deleted. Please create a new account.');
  }

  validateUserStatus(user);

  // if (!user.isEmailVerified) {
  //   //create verification email token
  //   const verificationToken = await TokenService.createVerifyEmailToken(user);
  //   //create verification email otp
  //   await OtpService.createVerificationEmailOtp(user.email);
  //   return { verificationToken };

  //   throw new ApiError(
  //     StatusCodes.BAD_REQUEST,
  //     'User not verified, Please verify your email, Check your email.'
  //   );
  // }

  // if (user.lockUntil && user.lockUntil > new Date()) {
  //   throw new ApiError(
  //     StatusCodes.TOO_MANY_REQUESTS,
  //     `Account is locked. Try again after ${config.auth.lockTime} minutes`,
  //   );
  // }

  const isPasswordValid = await bcryptjs.compare(reqpassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  /*---------------------------------------
  if (!isPasswordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= config.auth.maxLoginAttempts) {
      user.lockUntil = moment().add(config.auth.lockTime, 'minutes').toDate();
      await user.save();
      throw new ApiError(
        423,
        `Account locked for ${config.auth.lockTime} minutes due to too many failed attempts`,
      );
    }

    await user.save();
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.failedLoginAttempts > 0) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  -------------------------------------------*/

  const tokens = await TokenService.accessAndRefreshToken(user);

  // ✅ Save FCM token in UserDevices
  if (fcmToken) {
    const deviceType = deviceInfo?.deviceType || 'web';
    const deviceName = deviceInfo?.deviceName || 'Unknown Device';

    // Find or create device record
    let device:IUserDevices | any = await UserDevices.findOne({
      userId: user._id,
      fcmToken,
    });

    if (!device) {
      device = await UserDevices.create({
        userId: user._id,
        fcmToken,
        deviceType,
        deviceName,
        lastActive: new Date(),
      });
    } else {
      // Update last active
      device.lastActive = new Date();
      await device.save();
    }
  }

  const { password, ...userWithoutPassword } = user.toObject();

  return {
    userWithoutPassword,
    tokens
  };
};

/*------------------ 🆕
1. find user by email
2. validateUserStatus // check for isDeleted
3. handle account logged case [rate limit]
4. check password maching
    -----------------------------
    * get hashed password and salt for user from database
    * hashedPassword = bcrypt( intput password + salt)
    * if matched then login successful
    -------------------------
5. |-> for failed attempt lock account for some time
6. if password matched ...
7. return proper response based on role
8. if everything is ok .. then return accessTokens

    -------------------
    * token generator will generate
    - access token and refresh token

-------------------*/
const loginV2 = async (email: string,
  reqpassword: string,
  fcmToken? : string,
  deviceInfo?: { deviceType?: string, deviceName?: string }
) => {
  const user:IUser = await User.findOne({ email }).select('+password');

  console.log(user)
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.isDeleted == true) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your account is deleted. Please create a new account.');
  }

  validateUserStatus(user);

  const isPasswordValid = await bcryptjs.compare(reqpassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const tokens = await TokenService.accessAndRefreshToken(user);

  // ✅ Save FCM token in UserDevices
  if (fcmToken) {
    const deviceType = deviceInfo?.deviceType || 'web';
    const deviceName = deviceInfo?.deviceName || 'Unknown Device';

    // Find or create device record
    let device:IUserDevices | any = await UserDevices.findOne({
      userId: user._id,
      fcmToken,
    });

    if (!device) {
      device = await UserDevices.create({
        userId: user._id,
        fcmToken,
        deviceType,
        deviceName,
        lastActive: new Date(),
      });
    } else {
      // Update last active
      device.lastActive = new Date();
      await device.save();
    }
  }

  // 🔒 REDIS SESSION CACHING
  // Cache user session for faster subsequent requests
  try {
    const sessionKey = `session:${user._id}:${fcmToken || 'web'}`;
    const sessionData = {
      userId: user._id,
      email: user.email,
      role: user.role,
      fcmToken,
      deviceType: deviceInfo?.deviceType || 'web',
      deviceName: deviceInfo?.deviceName || 'Unknown Device',
      loginAt: new Date(),
    };
    
    // Cache session for 7 days (matches refresh token expiry)
    await redisClient.setEx(
      sessionKey,
      AUTH_SESSION_CONFIG.SESSION_TTL,
      JSON.stringify(sessionData)
    );
    
    logger.info(`Session cached for user ${user._id} (${sessionKey})`);
  } catch (error) {
    errorLogger.error('Failed to cache session:', error);
    // Don't throw - login should succeed even if caching fails
  }

  const { password, ...userWithoutPassword } = user.toObject();

  return {
    userWithoutPassword,
    tokens
  };
};

//[🚧][🧑‍💻✅][🧪]  // 🆗
const verifyEmail = async (email: string, token: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  await TokenService.verifyToken(
    token,
    config.token.TokenSecret,
    user?.isResetPassword ? TokenType.RESET_PASSWORD : TokenType.VERIFY,
  );

  //verify otp
  await OtpService.verifyOTP(
    user.email,
    otp,
    user?.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY,
  );

  user.isEmailVerified = true;
  await user.save();

  const tokens = await TokenService.accessAndRefreshToken(user);
  return {user, tokens} ;
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  //create reset password token
  const resetPasswordToken = await TokenService.createResetPasswordToken(user);
  const otp = await OtpService.createResetPasswordOtp(user.email);
  user.isResetPassword = true;
  await user.save();
  return { resetPasswordToken, otp }; // TODO : MUST : REMOVE THIS
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user?.isResetPassword) {
    const resetPasswordToken =
      await TokenService.createResetPasswordToken(user);
    await OtpService.createResetPasswordOtp(user.email);
    return { resetPasswordToken };
  }
  const verificationToken = await TokenService.createVerifyEmailToken(user);
  await OtpService.createVerificationEmailOtp(user.email);
  return { verificationToken };
};

const resetPassword = async (
  email: string,
  newPassword: string,
  otp: string,
) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  await OtpService.verifyOTP(
    user.email,
    otp,
    user?.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY,
  );
  user.password =  await bcryptjs.hash(newPassword, 12);

  user.isResetPassword = false;
  await user.save();
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect');
  }

  user.password = await bcryptjs.hash(newPassword, 12) ;
  await user.save();
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};
/**
 * Logout user
 * - Blacklist the refresh token
 * - Remove user session from Redis cache
 * - Optionally clear all user devices (for "logout from all devices")
 */
const logout = async (
  refreshToken: string,
  userId?: string,
  fcmToken?: string,
  logoutFromAllDevices: boolean = false
) => {
  try {
    // Step 1: Verify the refresh token and add to blacklist
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret as Secret
      ) as jwt.JwtPayload;

      // Blacklist the refresh token in Redis
      const blacklistKey = `blacklist:${refreshToken}`;
      const tokenExpiry = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : AUTH_SESSION_CONFIG.TOKEN_BLACKLIST_TTL;
      
      await redisClient.setEx(
        blacklistKey,
        Math.min(tokenExpiry, AUTH_SESSION_CONFIG.TOKEN_BLACKLIST_TTL),
        'blacklisted'
      );

      logger.info(`Token blacklisted for user ${decoded.userId}`);
    }

    // Step 2: Remove user session from Redis cache
    if (userId) {
      // Remove session cache for this user
      const sessionPattern = fcmToken 
        ? `session:${userId}:${fcmToken}`
        : `session:${userId}:*`;
      
      const keys = await redisClient.keys(sessionPattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Session cache cleared for user ${userId}`);
      }
    }

    // Step 3: Optionally logout from all devices
    if (logoutFromAllDevices && userId) {
      await UserDevices.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
      logger.info(`All devices logged out for user ${userId}`);
    } else if (fcmToken && userId) {
      // Remove only the current device
      await UserDevices.deleteOne({ 
        userId: new mongoose.Types.ObjectId(userId),
        fcmToken 
      });
      logger.info(`Device logged out for user ${userId}`);
    }

    return { success: true };
  } catch (error) {
    errorLogger.error('Logout error:', error);
    // Don't throw - logout should succeed even if blacklist fails
    return { success: true };
  }
};

/**
 * Refresh access token using refresh token
 * - Verify refresh token
 * - Check if token is blacklisted
 * - Generate new access and refresh token pair
 * - Blacklist old refresh token (token rotation)
 */
const refreshAuth = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
    }

    // Step 1: Check if token is blacklisted in Redis
    const blacklistKey = `blacklist:${refreshToken}`;
    const isBlacklisted = await redisClient.get(blacklistKey);
    
    if (isBlacklisted) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED, 
        'Refresh token has been revoked. Please login again.'
      );
    }

    // Step 2: Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.jwt.refreshSecret as Secret
    ) as jwt.JwtPayload & { userId: string; email: string; role: string };

    // Step 3: Check if user exists and is active
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
    }

    if (user.isDeleted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User account is deleted');
    }

    // Step 4: Verify token type in database
    const tokenDoc = await Token.findOne({
      token: refreshToken,
      user: user._id,
      type: TokenType.REFRESH,
    });

    if (!tokenDoc) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED, 
        'Invalid refresh token. Please login again.'
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED, 
        'Refresh token has expired. Please login again.'
      );
    }

    // Step 5: Generate new access and refresh token pair (token rotation)
    const tokens = await TokenService.accessAndRefreshToken(user);

    // Step 6: Blacklist old refresh token (prevent reuse)
    const oldTokenExpiry = tokenDoc.expiresAt.getTime() - Date.now();
    const oldTokenTTL = Math.max(0, Math.floor(oldTokenExpiry / 1000));
    
    if (oldTokenTTL > 0) {
      await redisClient.setEx(
        blacklistKey,
        Math.min(oldTokenTTL, AUTH_SESSION_CONFIG.TOKEN_BLACKLIST_TTL),
        'blacklisted'
      );
    }

    // Step 7: Delete old refresh token from database
    await Token.deleteOne({ token: refreshToken });

    logger.info(`Token refreshed for user ${user._id}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch (error) {
    errorLogger.error('Refresh token error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if ((error as any).name === 'TokenExpiredError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED, 
        'Refresh token has expired. Please login again.'
      );
    }
    
    if ((error as any).name === 'JsonWebTokenError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED, 
        'Invalid refresh token. Please login again.'
      );
    }
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to refresh token'
    );
  }
};


// -- we need to move these to OAuth modules
const googleLogin = async ({ idToken, role, acceptTOC }: IGoogleLoginPayload) => {
  
  // Step 1: Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken,
    //@ts-ignore
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Google token');

  const { sub: providerId, email, name, picture } = payload;
  if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not provided by Google');

  // Step 2: Check if OAuth account already exists
  let oAuthAccount = await OAuthAccount.findOne({
    authProvider: TAuthProvider.google,
    providerId,
    isDeleted: false,
  });

  if (oAuthAccount) {
    // ─── Returning OAuth user ───
    const user = await User.findById(oAuthAccount.userId);
    if (!user || user.isDeleted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account not found or deleted');
    }

    // Update token (store encrypted in production)
    await OAuthAccount.findByIdAndUpdate(oAuthAccount._id, {
      accessToken: idToken,
      lastUsedAt: new Date(),
    });

    const tokens = TokenService.accessAndRefreshToken(user);
    return { user, ...tokens };
  }

  // Step 3: No OAuth account — check if user exists by email
  let user = await User.findOne({ email, isDeleted: false });

  if (user) {
    // ─── Existing local user — LINK OAuth account ───
    if (!user.isEmailVerified) {
      // Auto-verify since Google confirmed the email
      await User.findByIdAndUpdate(user._id, { isEmailVerified: true });
      user.isEmailVerified = true;
    }

    await OAuthAccount.create({
      userId: user._id,
      authProvider: TAuthProvider.google,
      providerId,
      email,
      accessToken: idToken, // encrypt this!
      isVerified: true,
    });

    const tokens = TokenService.accessAndRefreshToken(user);
    return { user, ...tokens, isLinked: true };
  }

  // Step 4: Brand new user — register via Google
  if (!role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Role is required for new Google signup');
  }
  if (!acceptTOC) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You must accept Terms and Conditions');
  }

  // Create profile
  const userProfile = await UserProfile.create({ acceptTOC: true });

  // Create user (no password needed)
  const newUser = await User.create({
    name: name || email.split('@')[0],
    email,
    role,
    profileId: userProfile._id,
    isEmailVerified: true, // Google already verified
    authProvider: TAuthProvider.google,
    profileImage: picture ? { imageUrl: picture } : undefined,
  });

  // Link profile back
  eventEmitterForUpdateUserProfile.emit('eventEmitterForUpdateUserProfile', {
    userProfileId: userProfile._id,
    userId: newUser._id,
  });

  // Create OAuth account
  await OAuthAccount.create({
    userId: newUser._id,
    authProvider: TAuthProvider.google,
    providerId,
    email,
    accessToken: idToken, // encrypt this!
    isVerified: true,
  });

  const tokens = TokenService.accessAndRefreshToken(newUser);
  return { user: newUser, ...tokens, isNewUser: true };
};


const appleLogin = async ({ idToken, role, acceptTOC }: IGoogleLoginPayload) => {
  
  // Apple-specific token verification
  const applePayload = await appleSignin.verifyIdToken(idToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });

  const { sub: providerId, email } = applePayload;
  // ⚠️ Apple only sends email on FIRST login — after that it's null
  // So you MUST store it in OAuthAccount on first login

  if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not provided by Apple');

  // Step 2: Check if OAuth account already exists (using Apple provider)
  let oAuthAccount = await OAuthAccount.findOne({
    authProvider: TAuthProvider.apple,  // ✅ FIXED: Was TAuthProvider.google
    providerId,
    isDeleted: false,
  });

  if (oAuthAccount) {
    // ─── Returning Apple OAuth user ───
    const user = await User.findById(oAuthAccount.userId);
    if (!user || user.isDeleted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account not found or deleted');
    }

    // Update token (store encrypted in production)
    await OAuthAccount.findByIdAndUpdate(oAuthAccount._id, {
      accessToken: idToken,
      lastUsedAt: new Date(),
    });

    const tokens = TokenService.accessAndRefreshToken(user);
    return { user, ...tokens };
  }

  // Step 3: No OAuth account — check if user exists by email
  let user = await User.findOne({ email, isDeleted: false });

  if (user) {
    // ─── Existing local user — LINK Apple OAuth account ───
    if (!user.isEmailVerified) {
      // Auto-verify since Apple confirmed the email
      await User.findByIdAndUpdate(user._id, { isEmailVerified: true });
      user.isEmailVerified = true;
    }

    await OAuthAccount.create({
      userId: user._id,
      authProvider: TAuthProvider.apple,  // ✅ FIXED: Was TAuthProvider.google
      providerId,
      email,
      accessToken: idToken, // encrypt this!
      isVerified: true,
    });

    const tokens = TokenService.accessAndRefreshToken(user);
    return { user, ...tokens, isLinked: true };
  }

  // Step 4: Brand new user — register via Apple
  if (!role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Role is required for new Apple signup');
  }
  if (!acceptTOC) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You must accept Terms and Conditions');
  }

  // Create profile
  const userProfile = await UserProfile.create({ acceptTOC: true });

  // Create user (no password needed)
  const newUser = await User.create({
    name: email.split('@')[0], // Apple doesn't provide name in token, use email prefix
    email,
    role,
    profileId: userProfile._id,
    isEmailVerified: true, // Apple already verified
    authProvider: TAuthProvider.apple,  // ✅ FIXED: Was TAuthProvider.google
  });

  // Link profile back
  eventEmitterForUpdateUserProfile.emit('eventEmitterForUpdateUserProfile', {
    userProfileId: userProfile._id,
    userId: newUser._id,
  });

  // Create OAuth account
  await OAuthAccount.create({
    userId: newUser._id,
    authProvider: TAuthProvider.apple,  // ✅ FIXED: Was TAuthProvider.google
    providerId,
    email,
    accessToken: idToken, // encrypt this!
    isVerified: true,
  });

  const tokens = TokenService.accessAndRefreshToken(newUser);
  return { user: newUser, ...tokens, isNewUser: true };
};

export const AuthService = {
  googleLogin,
  appleLogin,
  createUser,
  createUserV2,
  login,
  loginV2,
  verifyEmail,
  resetPassword,
  forgotPassword,
  resendOtp,
  logout,
  changePassword,
  refreshAuth,
};
