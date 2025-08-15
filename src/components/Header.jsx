import React, { useState } from 'react';
import { useAuth } from '../redux/hooks/useAuth';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header style={{
      backgroundColor: '#2c3e50',
      padding: '0',
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      width: '100vw',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="header-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        width: '100%',
        margin: '0'
      }}>
        
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '100px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/images/logo.png" 
              alt="Uptrend Logo" 
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '40px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              UT
            </div>
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            display: 'none'
          }}>
            Uptrends India
          </h1>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div style={{
          flex: 1,
          maxWidth: '400px',
          margin: '0 24px',
          position: 'relative',
          display: 'none'
        }} className="search-container">
          <input
            type="text"
            placeholder="Search here..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '16px'
          }}>
            🔍
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          
          {/* Notification Icon */}
          <div style={{
            position: 'relative',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
            <div style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              🔔
            </div>
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#e74c3c',
              borderRadius: '50%'
            }}></div>
          </div>

          {/* Calendar Icon */}
          {/* <div style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
            <div style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              📅
            </div>
          </div> */}

          {/* Message Icon */}
          {/* <div style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
            <div style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              💬
            </div>
          </div> */}

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={toggleDropdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: isDropdownOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isDropdownOpen) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDropdownOpen) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#3498db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                display: 'none'
              }} className="admin-text">
                Admin
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}>
                ▼
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: '180px',
                overflow: 'hidden',
                zIndex: 1001
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    Admin User
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {user?.email || 'admin@uptrends.com'}
                  </div>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <div style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    👤 Profile
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    ⚙️ Settings
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    ❓ Help
                  </div>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />
                  <div
                    onClick={handleLogout}
                    style={{
                      padding: '8px 16px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      color: '#e74c3c',
                      transition: 'background-color 0.2s ease',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {isLoading ? '⏳ Logging out...' : '🚪 Logout'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div style={{
        padding: '0 24px 12px',
        display: 'none'
      }} className="mobile-search">
        <input
          type="text"
          placeholder="Search here..."
          style={{
            width: '100%',
            padding: '10px 16px 10px 40px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>


    </header>
  );
};

export default Header;
