import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { showToast } = useToast();

  const fillDemo = () => {
    setEmail('demo@example.com');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await api.forgotPassword({ email });
      setIsSuccess(true);
      if (res.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
      showToast('Reset link generated successfully', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to request password reset');
      showToast(err.message || 'Error occurred', 'error');
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
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Reset Password</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Enter your account email to receive a secure password reset link
          </p>
        </div>

        {/* Demo Credentials Quick Fill */}
        {!isSuccess && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#a5b4fc' }}>
                Testing Demo Account?
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                demo@example.com
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fillDemo}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Fill Demo
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
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
              Check your email
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched.
            </p>

            {devResetUrl && (
              <div
                style={{
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', marginBottom: '4px' }}>
                  ⚡ Quick Test Preview (Development Mode)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  No external mail server required. Click below to proceed to the reset password page:
                </div>
                <Link
                  to={devResetUrl.replace('http://localhost:5173', '')}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '13px',
                    padding: '8px 12px'
                  }}
                >
                  <span>Open Reset Password Page</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                setIsSuccess(false);
                setDevResetUrl(null);
              }}
            >
              Resend with different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Account Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending instructions...'
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Send Reset Link</span>
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
