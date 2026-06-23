import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import './OtpVerificationPage.css';

const OTP_LENGTH = 6;
const TIMER_DURATION = 300; // 5 minutes in seconds

const OtpVerificationPage = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyOtp(email, code);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    try {
      setError('');
      await resendOtp(email);
      setTimeLeft(TIMER_DURATION);
      setCanResend(false);
      setOtp(new Array(OTP_LENGTH).fill(''));
      setSuccess('A new code has been sent to your email!');
      setTimeout(() => setSuccess(''), 3000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(message);
    }
  }, [email, resendOtp]);

  if (!email) return null;

  return (
    <AuthLayout title="Verify Your Email" subtitle="Enter the verification code">
      <form className="otp-form" onSubmit={handleSubmit} noValidate>
        <div className="otp-email-badge">
          <span>📧</span>
          <span>{email}</span>
        </div>

        {error && (
          <div className="auth-error" role="alert" style={{ width: '100%' }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success" role="status" style={{ width: '100%' }}>
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`otp-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
              aria-label={`Digit ${index + 1}`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="otp-timer">
          {!canResend ? (
            <span className={`otp-countdown ${timeLeft <= 30 ? 'expiring' : ''}`}>
              Code expires in {formatTime(timeLeft)}
            </span>
          ) : (
            <span className="otp-countdown" style={{ color: 'var(--text-muted)' }}>
              Code expired
            </span>
          )}
          <button
            type="button"
            className="otp-resend"
            onClick={handleResend}
            disabled={!canResend}
          >
            Resend Code
          </button>
        </div>

        <div className="otp-actions">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Verify Email
          </Button>
        </div>

        <div className="auth-form-footer">
          <p>
            Back to
            <Link to="/login"> Sign In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default OtpVerificationPage;
