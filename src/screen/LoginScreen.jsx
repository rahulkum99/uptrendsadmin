import React, { useState, useEffect } from 'react';
import { useAuth } from '../redux/hooks/useAuth';

const LoginScreen = () => {
  console.log('LoginScreen component rendering');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    // Clear any existing errors when component mounts
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    try {
      await login(formData);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '400px',
        minWidth: '280px'
      }}>
        
        {/* Main Login Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* Logo */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white',
              fontSize: '1.5rem'
            }}>
              📈
            </div>
            
            {/* Title */}
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 8px 0',
              lineHeight: '1.2'
            }}>
              Uptrends Partners
            </h2>
            <p style={{
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              color: '#666',
              margin: '0'
            }}>
              Admin Dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px'
              }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '20px',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Signing In...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              ℹ️ Demo Credentials
            </div>
            <div style={{ fontSize: '12px', color: '#333', lineHeight: '1.4' }}>
              <div><strong>Email:</strong> salon4mein@gmail.com</div>
              <div><strong>Password:</strong> Rahul@123</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '11px',
            color: '#666'
          }}>
            🛡️ Secure Admin Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
