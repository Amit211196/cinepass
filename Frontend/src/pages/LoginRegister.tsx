import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, AlertTriangle } from 'lucide-react';

export const LoginRegister: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register fields
  const [regEmail, setRegEmail] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const fromPath = location.state?.from || '/';
  const selectedSeats = location.state?.selectedSeats || [];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Login successful!', 'success');
      // Redirect back to page or home
      navigate(fromPath, { state: { selectedSeats }, replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regEmail || !regName || !regPassword || !regConfirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(regEmail, regName, regPassword);
      showToast('Registration successful! Welcome to CinePass.', 'success');
      // Redirect back to page or home
      navigate(fromPath, { state: { selectedSeats }, replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Tabs */}
      <div className="auth-tabs">
        <div 
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => { setActiveTab('login'); setError(null); }}
        >
          Sign In
        </div>
        <div 
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setError(null); }}
        >
          Register
        </div>
      </div>

      {/* Form Body */}
      <div className="auth-body">
        {activeTab === 'login' ? (
          <div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account to book movie tickets.</p>

            {error && (
              <div className="auth-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-container">
                  <Mail size={16} className="form-input-icon" />
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@example.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-container">
                  <Lock size={16} className="form-input-icon" />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <p>Demo admin: <b>admin@cinepass.com</b> / <b>admin123</b></p>
              <p>Demo user: <b>user@cinepass.com</b> / <b>user123</b></p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Sign up for a free account to select seats and secure bookings.</p>

            {error && (
              <div className="auth-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-container">
                  <User size={16} className="form-input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="John Doe" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-container">
                  <Mail size={16} className="form-input-icon" />
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@example.com" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Password</label>
                  <div className="form-input-container">
                    <Lock size={16} className="form-input-icon" />
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="form-input-container">
                    <Lock size={16} className="form-input-icon" />
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
