import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setIsTokenValid(false);
      setVerifyError('Missing password reset token in URL.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await api.verifyResetToken(token);
        if (res.valid) {
          setIsTokenValid(true);
          setUserEmail(res.email || '');
        } else {
          setIsTokenValid(false);
          setVerifyError(res.message || 'Reset link is invalid or has expired.');
        }
      } catch (err) {
        setIsTokenValid(false);
        setVerifyError(err.message || 'Reset link is invalid or has expired.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  // Compute password strength
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 2, label: 'Good', color: '#f59e0b' };
    return { score: 3, label: 'Strong', color: '#10b981' };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters long' });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({
        token,
        password
      });
      setIsSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        showToast(err.message || 'Failed to reset password', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <ThemeToggle className="auth-theme-toggle" />
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="brand-logo"
            style={{ width: 48, height: 48, margin: '0 auto 14px' }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Set New Password</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {userEmail ? (
              <>Resetting password for <strong>{userEmail}</strong></>
            ) : (
              'Create a strong new password for your account'
            )}
          </p>
        </div>

        {/* Verifying State */}
        {isVerifying && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <RefreshCw
              size={32}
              className="spin"
              style={{ margin: '0 auto 16px', color: '#818cf8' }}
            />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Verifying your reset security link...
            </p>
          </div>
        )}

        {/* Invalid or Expired Token */}
        {!isVerifying && !isTokenValid && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <AlertCircle size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Invalid or Expired Link
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              {verifyError || 'This password reset link is invalid or has expired for security reasons.'}
            </p>
            <Link
              to="/forgot-password"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Request a New Reset Link
            </Link>
          </div>
        )}

        {/* Success Screen */}
        {!isVerifying && isTokenValid && isSuccess && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Password Reset Complete!
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Your account password has been updated securely. You can now sign in with your new credentials.
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Sign In to TaskFlow
            </Link>
          </div>
        )}

        {/* Active Reset Form */}
        {!isVerifying && isTokenValid && !isSuccess && (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 4
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="form-error-text">{fieldErrors.password}</span>
              )}

              {/* Password strength indicator */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 2,
                        background: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)'
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 2,
                        background: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)'
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 2,
                        background: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11.5px', color: strength.color, fontWeight: 500 }}>
                    Strength: {strength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 4
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="form-error-text">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Updating password...'
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '13.5px',
            color: 'var(--text-secondary)'
          }}
        >
          <Link
            to="/login"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
