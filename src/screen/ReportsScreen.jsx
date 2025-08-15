import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const ReportsScreen = () => {
  const { user, is_verified } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Mock data for reports
  const reportData = {
    totalRevenue: '₹5,67,890',
    totalBookings: 1244,
    averageRating: 4.6,
    activePartners: 27,
    revenueGrowth: '+12.4%',
    bookingGrowth: '+8.3%',
    topServices: [
      { name: 'Haircut & Styling', bookings: 456, revenue: '₹1,23,456' },
      { name: 'Facial Treatment', bookings: 234, revenue: '₹89,123' },
      { name: 'Bridal Makeup', bookings: 89, revenue: '₹2,34,567' },
      { name: 'Hair Coloring', bookings: 156, revenue: '₹1,12,345' }
    ],
    topPartners: [
      { name: 'The Beauty Lounge', bookings: 234, revenue: '₹1,33,453' },
      { name: 'Glamour Studio', bookings: 189, revenue: '₹98,234' },
      { name: 'Elegance Salon', bookings: 145, revenue: '₹1,45,678' },
      { name: 'Style Hub', bookings: 123, revenue: '₹76,543' }
    ]
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      margin: 0,
      padding: 0,
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Header />

      <div style={{
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        marginTop: '64px',
        width: `calc(100vw - ${sidebarCollapsed ? '80px' : '280px'})`,
        minHeight: 'calc(100vh - 64px)',
        transition: 'all 0.3s ease',
        overflow: 'auto'
      }}>
        <div className="container-fluid p-4">
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                    Reports & Analytics
                  </h2>
                  <p className="text-muted mb-0">Comprehensive insights into your business performance</p>
                </div>
                <div className="d-flex gap-3">
                  <select
                    className="form-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                  <button
                    className="btn btn-outline-primary"
                    style={{ padding: '10px 20px', borderRadius: '8px' }}
                  >
                    <i className="fas fa-download me-2"></i>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{reportData.totalRevenue}</h4>
                      <p className="mb-0">Total Revenue</p>
                      <small className="text-success">{reportData.revenueGrowth} from last period</small>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-rupee-sign fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{reportData.totalBookings}</h4>
                      <p className="mb-0">Total Bookings</p>
                      <small className="text-success">{reportData.bookingGrowth} from last period</small>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar-check fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{reportData.averageRating}</h4>
                      <p className="mb-0">Average Rating</p>
                      <small>Based on customer reviews</small>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-star fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{reportData.activePartners}</h4>
                      <p className="mb-0">Active Partners</p>
                      <small>Currently operational</small>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-building fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Tables */}
          <div className="row">
            {/* Top Services */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    Top Services
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Bookings</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topServices.map((service, index) => (
                          <tr key={index}>
                            <td>{service.name}</td>
                            <td>{service.bookings}</td>
                            <td className="text-success fw-bold">{service.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Partners */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-trophy me-2"></i>
                    Top Performing Partners
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Partner</th>
                          <th>Bookings</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topPartners.map((partner, index) => (
                          <tr key={index}>
                            <td>{partner.name}</td>
                            <td>{partner.bookings}</td>
                            <td className="text-success fw-bold">{partner.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Analytics */}
          <div className="row">
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Performance Trends
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <div className="border rounded p-3">
                        <h6 className="text-muted">Revenue Trend</h6>
                        <div className="text-success">
                          <i className="fas fa-arrow-up fa-2x"></i>
                        </div>
                        <p className="mb-0 mt-2">Consistent growth</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="border rounded p-3">
                        <h6 className="text-muted">Booking Trend</h6>
                        <div className="text-success">
                          <i className="fas fa-arrow-up fa-2x"></i>
                        </div>
                        <p className="mb-0 mt-2">Steady increase</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="border rounded p-3">
                        <h6 className="text-muted">Customer Satisfaction</h6>
                        <div className="text-warning">
                          <i className="fas fa-star fa-2x"></i>
                        </div>
                        <p className="mb-0 mt-2">High ratings</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="border rounded p-3">
                        <h6 className="text-muted">Partner Growth</h6>
                        <div className="text-info">
                          <i className="fas fa-plus fa-2x"></i>
                        </div>
                        <p className="mb-0 mt-2">Expanding network</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
