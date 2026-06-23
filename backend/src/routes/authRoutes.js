const { Router } = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validate,
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require('../validations/authValidation');

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email with OTP code
 * @access  Public
 */
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP code to email
 * @access  Public
 */
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token cookie
 * @access  Public (requires valid refresh token cookie)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and revoke refresh tokens
 * @access  Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
