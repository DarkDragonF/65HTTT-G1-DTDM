const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Otp = require('../models/Otp');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middlewares/errorHandler');
const emailService = require('./emailService');

/**
 * Generates a random 6-digit OTP code.
 * @returns {string} 6-digit string
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Auth service — contains all authentication business logic.
 * Controllers should delegate to these methods.
 */
const authService = {
  /**
   * Registers a new user account.
   * 1. Checks for duplicate email
   * 2. Hashes password
   * 3. Creates user record
   * 4. Generates and stores OTP for email verification
   *
   * @param {Object} params
   * @param {string} params.fullName
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} [params.phone]
   * @param {string} [params.role]
   * @returns {Promise<Object>} Created user (without password)
   */
  register: async ({ fullName, email, password, phone, role, recaptchaToken }) => {
    // 0. Verify Google reCAPTCHA v2 token if configured
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && recaptchaSecret !== 'placeholder' && recaptchaSecret.trim() !== '') {
      if (!recaptchaToken) {
        throw new AppError('reCAPTCHA verification is required', 400);
      }
      
      console.log('[reCAPTCHA] Verifying token with Google APIs...');
      try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: recaptchaToken
          })
        });

        if (!response.ok) {
          throw new Error(`Google responded with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          console.warn('[reCAPTCHA] Verification failed:', JSON.stringify(data));
          throw new AppError('reCAPTCHA validation failed. Please try again.', 400);
        }
        console.log('[reCAPTCHA] Token verified successfully.');
      } catch (err) {
        console.error('[reCAPTCHA] Verification error:', err.message);
        if (err instanceof AppError) throw err;
        throw new AppError('Google reCAPTCHA service is currently unreachable.', 503);
      }
    } else {
      console.log('[reCAPTCHA] Secret key not configured or set to placeholder. Bypassing validation.');
    }

    // 1. Check if email already exists
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create user
    const userId = await User.create({ fullName, email, passwordHash, phone, role });

    // 4. Generate 6-digit OTP (expires in 5 minutes)
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await Otp.create({
      userId,
      code: otp,
      type: 'email_verification',
      expiresAt,
    });

    // 5. Send email via ZeptoMail (with fallback to mock logger)
    console.log(`===== OTP for ${email}: ${otp} =====`);
    await emailService.sendVerificationOtp(email, fullName, otp);

    // 6. Return user data (without password)
    const user = await User.findById(userId);
    return user;
  },

  /**
   * Verifies a user's email using an OTP code.
   *
   * @param {string} email - User's email
   * @param {string} code - 6-digit OTP code
   * @returns {Promise<Object>} Success result
   */
  verifyOtp: async (email, code) => {
    // 1. Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2. Find valid OTP
    const otp = await Otp.findValid(user.id, code, 'email_verification');
    if (!otp) {
      throw new AppError('Invalid or expired OTP code', 400);
    }

    // 3. Mark OTP as used
    await Otp.markUsed(otp.id);

    // 4. Update user verification status
    await User.updateVerificationStatus(user.id, true);

    return { message: 'Email verified successfully' };

  },

  /**
   * Resends an OTP code to a user's email.
   *
   * @param {string} email - User's email
   * @returns {Promise<Object>} Success result
   */
  resendOtp: async (email) => {
    // 1. Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2. Check if already verified
    if (user.is_verified) {
      throw new AppError('Email is already verified', 400);
    }

    // 3. Generate new OTP (expires in 5 minutes)
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({
      userId: user.id,
      code: otp,
      type: 'email_verification',
      expiresAt,
    });

    // 4. Send email via ZeptoMail (with fallback to mock logger)
    console.log(`===== OTP for ${email}: ${otp} =====`);
    await emailService.sendVerificationOtp(email, user.full_name, otp);

    return { message: 'OTP sent successfully' };
  },

  /**
   * Authenticates a user and returns tokens.
   *
   * @param {string} email - User's email
   * @param {string} password - Plain-text password
   * @returns {Promise<Object>} { user, accessToken, refreshToken }
   */
  login: async (email, password) => {
    // 1. Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // 2. Compare password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // 3. Check if email is verified
    if (!user.is_verified) {
      throw new AppError('Please verify your email first', 403);
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // 4. Generate access token
    const accessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Generate refresh token
    const refreshTokenStr = generateRefreshToken({ id: user.id });

    // 6. Store refresh token in database (expires in 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenStr,
      expiresAt,
    });

    // 7. Return user (without password) and tokens
    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenStr,
    };
  },

  /**
   * Generates a new access token using a valid refresh token.
   *
   * @param {string} token - The refresh token JWT
   * @returns {Promise<Object>} { accessToken }
   */
  refreshToken: async (token) => {
    // 1. Verify refresh token JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // 2. Find token in database
    const storedToken = await RefreshToken.findByToken(token);
    if (!storedToken) {
      throw new AppError('Refresh token not found', 401);
    }

    // 3. Check if not expired in database
    if (new Date(storedToken.expires_at) < new Date()) {
      throw new AppError('Refresh token has expired', 401);
    }

    // 4. Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // 5. Generate new access token
    const accessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  },

  /**
   * Logs out a user by revoking all their refresh tokens.
   *
   * @param {number} userId - The user ID
   * @returns {Promise<void>}
   */
  logout: async (userId) => {
    await RefreshToken.deleteByUserId(userId);
  },

  /**
   * Retrieves the current authenticated user's profile.
   *
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} User profile (without password)
   */
  getMe: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },
};

module.exports = authService;
