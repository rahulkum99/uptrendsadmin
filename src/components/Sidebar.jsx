import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '🏠',
      path: '/dashboard'
    },
    {
      id: 'partners',
      name: 'Partners',
      icon: '🏢',
      path: '/partners'
    },
    {
      id: 'bookings',
      name: 'Bookings',
      icon: '📅',
      path: '/bookings'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: '📊',
      path: '/reports'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: '👤',
      path: '/profile'
    }
  ];

  const [activeItem, setActiveItem] = useState(() => {
    // Set initial active item based on current location
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    return currentMenuItem ? currentMenuItem.name : 'Dashboard';
  });

  // Update active item when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    console.log('Sidebar: Current path changed to:', currentPath);
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      console.log('Sidebar: Setting active item to:', currentMenuItem.name);
      setActiveItem(currentMenuItem.name);
    }
  }, [location.pathname, menuItems]);

  const handleItemClick = (item) => {
    console.log('Sidebar item clicked:', item.name, 'navigating to:', item.path);
    setActiveItem(item.name);
    navigate(item.path);
  };

  return (
    <div style={{
      width: isCollapsed ? '80px' : '280px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 999,
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
    }}>
      
      {/* Sidebar Header - Space for main header */}
      <div style={{
        height: '64px', // Match header height
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '0 12px' : '0 24px',
        backgroundColor: '#fafafa'
      }}>
        {!isCollapsed && (
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            Menu
          </div>
        )}
        
        {/* Toggle Button */}
        <div
          onClick={onToggle}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: isCollapsed ? '0' : 'auto',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <span style={{
            fontSize: '14px',
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ◀
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{
        padding: '20px 0',
        height: 'calc(100vh - 64px - 100px)', // Account for header and bottom section
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      className="sidebar-scroll-container">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path || item.name === activeItem;
          const isHovered = hoveredItem === item.id;
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isCollapsed ? '16px 0' : '16px 24px',
                margin: isCollapsed ? '8px 12px' : '8px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                
                // Active state
                backgroundColor: isActive 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  : isHovered 
                    ? 'rgba(102, 126, 234, 0.05)' 
                    : 'transparent',
                
                // Gradient border for active item
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                  : isHovered 
                    ? 'rgba(102, 126, 234, 0.08)' 
                    : 'transparent',
                
                // Transform on hover
                transform: isHovered ? 'translateX(4px) scale(1.02)' : 'translateX(0) scale(1)',
                boxShadow: isHovered 
                  ? '0 4px 20px rgba(102, 126, 234, 0.15)' 
                  : isActive 
                    ? '0 2px 10px rgba(102, 126, 234, 0.1)' 
                    : 'none'
              }}
            >
              
              {/* Active Indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: isCollapsed ? '50%' : '0',
                  top: '50%',
                  transform: isCollapsed ? 'translate(-50%, -50%)' : 'translateY(-50%)',
                  width: isCollapsed ? '4px' : '4px',
                  height: isCollapsed ? '20px' : '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}></div>
              )}
              
              {/* Icon */}
              <div style={{
                fontSize: '20px',
                marginRight: isCollapsed ? '0' : '16px',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                filter: isActive 
                  ? 'brightness(1.2) saturate(1.3)' 
                  : isHovered 
                    ? 'brightness(1.1)' 
                    : 'brightness(1)'
              }}>
                {item.icon}
              </div>
              
              {/* Text */}
              {!isCollapsed && (
                <span style={{
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive 
                    ? '#2c3e50' 
                    : isHovered 
                      ? '#374151' 
                      : '#6b7280',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.025em'
                }}>
                  {item.name}
                </span>
              )}
              
              {/* Hover Glow Effect */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  opacity: 0.5,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && isHovered && (
                <div style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  marginLeft: '12px',
                  zIndex: 1000,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                  {item.name}
                  
                  {/* Tooltip Arrow */}
                  <div style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '6px solid #2c3e50'
                  }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Bottom Section */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: 0,
        right: 0,
        padding: isCollapsed ? '16px 12px' : '16px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f0f0f0',
        height: '100px'
      }}>
        {!isCollapsed && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Need Help?
            </div>
            <button style={{
              backgroundColor: 'transparent',
              border: '1px solid #667eea',
              color: '#667eea',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#667eea';
            }}>
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
