import React, { useState, useEffect } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiCall } from '../utils/api';
import { store } from '../redux/store';

const Header = () => {
  const { user, logout, isLoading, access_token } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!access_token) return;
      setIsLoadingProfile(true);
      try {
        const data = await apiCall(API_ENDPOINTS.PROFILE, { method: 'GET' }, store);
        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [access_token]);

  // Function to refresh profile data (can be called from other components)
  const refreshProfileData = () => {
    setProfileData(null); // Reset to trigger a new fetch
  };

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
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
                fontWeight: 'bold',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {isLoadingProfile ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#3498db',
                    borderRadius: '50%'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : profileData?.profile_picture ? (
                  <img
                    src={profileData.profile_picture}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      // Fallback to text avatar if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: (isLoadingProfile || profileData?.profile_picture) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#3498db',
                  borderRadius: '50%'
                }}>
                  {profileData?.first_name 
                    ? profileData.first_name.charAt(0).toUpperCase() 
                    : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')
                  }
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px'
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {isLoadingProfile ? 'Loading...' : 
                    (profileData?.first_name && profileData?.last_name 
                      ? `${profileData.first_name} ${profileData.last_name}` 
                      : (user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'Admin User'
                        )
                    )
                  }
                  {profileData?.is_verified && (
                    <span style={{
                      backgroundColor: 'rgba(46, 204, 113, 0.2)',
                      color: '#2ecc71',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>Verified</span>
                  )}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  {profileData?.user_email || user?.email || 'admin@uptrends.com'}
                </div>
                {profileData?.user_phone_number && (
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '12px',
                    lineHeight: '1.2'
                  }}>
                    {profileData.user_phone_number}
                  </div>
                )}
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
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#3498db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    {isLoadingProfile ? (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#3498db',
                        borderRadius: '50%'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                      </div>
                    ) : profileData?.profile_picture ? (
                      <img
                        src={profileData.profile_picture}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                        onError={(e) => {
                          // Fallback to text avatar if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: (isLoadingProfile || profileData?.profile_picture) ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#3498db',
                      borderRadius: '50%'
                    }}>
                      {profileData?.first_name 
                        ? profileData.first_name.charAt(0).toUpperCase() 
                        : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')
                      }
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {isLoadingProfile ? 'Loading...' : 
                          (profileData?.first_name && profileData?.last_name 
                            ? `${profileData.first_name} ${profileData.last_name}` 
                            : (user?.first_name && user?.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : 'Admin User'
                              )
                          )
                        }
                      </div>
                      {profileData?.is_verified && (
                        <span style={{
                          backgroundColor: 'rgba(46, 204, 113, 0.15)',
                          color: '#2ecc71',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>Verified</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {profileData?.user_email || user?.email || 'admin@uptrends.com'}
                    </div>
                    {profileData?.user_phone_number && (
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '2px'
                      }}>
                        {profileData.user_phone_number}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <div 
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    style={{
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
     </>
   );
 };

export default Header;
