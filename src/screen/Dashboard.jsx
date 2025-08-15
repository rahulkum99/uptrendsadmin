import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

import {
  FaUsers,
  FaCalendarCheck,
  FaRupeeSign,
  FaClock,
  FaUserTimes,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaChevronRight
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components only once
if (!ChartJS.registry.controllers.bar) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
}

const Dashboard = () => {
  console.log('Dashboard component mounted/re-rendered');
  const { user, is_verified } = useAuth();
  
  useEffect(() => {
    console.log('Dashboard component mounted');
    return () => {
      console.log('Dashboard component unmounted');
    };
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Setup automatic token refresh
  useTokenRefresh();

  // Memoize toggle function to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    barChartData: {
      labels: ['5', '10', '15', '20', '25', '30'],
      datasets: [
        {
          label: 'Premium Plan',
          data: [40, 55, 25, 70, 65, 70],
          backgroundColor: '#6f42c1',
          borderRadius: 4,
          barThickness: 20
        },
        {
          label: 'Standard Plan',
          data: [30, 40, 20, 50, 45, 40],
          backgroundColor: '#dc3545',
          borderRadius: 4,
          barThickness: 20
        },
        {
          label: 'Basic Plan',
          data: [25, 35, 15, 45, 40, 35],
          backgroundColor: '#17a2b8',
          borderRadius: 4,
          barThickness: 20
        }
      ]
    },
    lineChartData: {
      labels: ['5', '10', '15', '20', '25', '30'],
      datasets: [
        {
          data: [10, 25, 15, 45, 35, 60, 25, 75, 50, 120],
          borderColor: '#e91e63',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#e91e63',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          data: [15, 35, 25, 30, 45, 25, 15, 45, 35, 100],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#ff9800',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          data: [5, 15, 25, 20, 30, 15, 35, 25, 45, 60],
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#00bcd4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    }
  }), []);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    bar: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          max: 120,
          ticks: {
            stepSize: 30
          }
        }
      }
    },
    line: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          max: 240,
          ticks: {
            stepSize: 60
          }
        }
      }
    }
  }), []);

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
        marginTop: '64px', // Account for fixed header
        width: `calc(100vw - ${sidebarCollapsed ? '80px' : '280px'})`,
        minHeight: 'calc(100vh - 64px)',
        transition: 'all 0.3s ease',
        overflow: 'auto'
      }}>
                <div className="container-fluid p-4">

          {/* Statistics Cards Row */}
          <div className="row g-4 mb-4">
            {/* Total Partners */}
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                        <FaUsers className="text-danger fs-4" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="text-muted small">Total Partners</div>
                      <div className="fs-4 fw-bold text-dark">2451</div>
                      <div className="d-flex align-items-center mt-1">
                        <FaArrowUp className="text-success me-1 small" />
                        <span className="text-success small">12% Increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                        <FaCalendarCheck className="text-warning fs-4" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="text-muted small">Total Bookings</div>
                      <div className="fs-4 fw-bold text-dark">18,345</div>
                      <div className="d-flex align-items-center mt-1">
                        <FaArrowUp className="text-success me-1 small" />
                        <span className="text-success small">34% Increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-opacity-10 rounded-3 p-3">
                        <FaRupeeSign className="text-info fs-4" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="text-muted small">Revenue</div>
                      <div className="fs-4 fw-bold text-dark">₹22.5L</div>
                      <div className="d-flex align-items-center mt-1">
                        <FaArrowUp className="text-success me-1 small" />
                        <span className="text-success small">24% Increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                        <FaClock className="text-primary fs-4" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="text-muted small">Active Users</div>
                      <div className="fs-4 fw-bold text-dark">12,554</div>
                      <div className="d-flex align-items-center mt-1">
                        <FaArrowDown className="text-danger me-1 small" />
                        <span className="text-danger small">5% Decrease</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Non Active Users */}
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                        <FaUserTimes className="text-danger fs-4" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="text-muted small">Non Active Users</div>
                      <div className="fs-4 fw-bold text-dark">4,482</div>
                      <div className="d-flex align-items-center mt-1">
                        <FaArrowDown className="text-danger me-1 small" />
                        <span className="text-danger small">5% Decrease</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
          
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Revenue by Subscription Plan</h5>
                  <div className="dropdown">
                    <button className="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Last 30 days
                    </button>
                  </div>
                </div>
                <div className="card-body">
                 
                  <div className="row mb-4">
                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                        <div>
                          <div className="text-muted small">Premium Plan</div>
                          <div className="fw-bold">₹62,400</div>
                          <div className="text-muted small">65%</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-danger rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                        <div>
                          <div className="text-muted small">Standard Plan</div>
                          <div className="fw-bold">₹89,400</div>
                          <div className="text-muted small">25%</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-info rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                        <div>
                          <div className="text-muted small">Basic Plan</div>
                          <div className="fw-bold">₹12,400</div>
                          <div className="text-muted small">10%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bar Chart */}
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: ['5', '10', '15', '20', '25', '30'],
                        datasets: [
                          {
                            label: 'Premium Plan',
                            data: [40, 55, 25, 70, 65, 70],
                            backgroundColor: '#6f42c1',
                            borderRadius: 4,
                            barThickness: 20
                          },
                          {
                            label: 'Standard Plan',
                            data: [30, 40, 20, 50, 45, 40],
                            backgroundColor: '#dc3545',
                            borderRadius: 4,
                            barThickness: 20
                          },
                          {
                            label: 'Basic Plan',
                            data: [25, 35, 15, 45, 40, 35],
                            backgroundColor: '#17a2b8',
                            borderRadius: 4,
                            barThickness: 20
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            }
                          },
                          y: {
                            beginAtZero: true,
                            max: 120,
                            ticks: {
                              stepSize: 30
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salon Onboarding Requests Chart */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Salon Onboarding Requests</h5>
                  <div className="dropdown">
                    <button className="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Last 30 days
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <span className="text-muted me-2">Increment</span>
                    <span className="text-warning">20% ↗</span>
                  </div>
                  <div style={{ height: '300px' }}>
                    <Line
                      data={{
                        labels: ['5', '10', '15', '20', '25', '30'],
                        datasets: [
                          {
                            data: [10, 25, 15, 45, 35, 60, 25, 75, 50, 120],
                            borderColor: '#e91e63',
                            backgroundColor: 'rgba(233, 30, 99, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: '#e91e63',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5
                          },
                          {
                            data: [15, 35, 25, 30, 45, 25, 15, 45, 35, 100],
                            borderColor: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: '#ff9800',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5
                          },
                          {
                            data: [5, 15, 25, 20, 30, 15, 35, 25, 45, 60],
                            borderColor: '#00bcd4',
                            backgroundColor: 'rgba(0, 188, 212, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: '#00bcd4',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            }
                          },
                          y: {
                            beginAtZero: true,
                            max: 240,
                            ticks: {
                              stepSize: 60
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Recent Bookings and New Salon Requests */}
          <div className="row g-4">
            {/* Recent Bookings */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Recent Bookings</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {/* Booking Item 1 */}
                    <div className="list-group-item border-0 p-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <span className="text-white fw-bold">TBL</span>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="fw-bold">Hair Cut & Style</div>
                          <div className="text-muted small">The Beauty Lounge - Premium Plan</div>
                        </div>
                        <div className="text-success fw-bold">₹400</div>
                      </div>
                    </div>

                    {/* Booking Item 2 */}
                    <div className="list-group-item border-0 p-3 bg-light bg-opacity-50">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <span className="text-white fw-bold">BP</span>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="fw-bold">Hair Cut & Style</div>
                          <div className="text-muted small">Beauty Plus - Basic Plan</div>
                        </div>
                        <div className="text-success fw-bold">₹400</div>
                      </div>
                    </div>

                    {/* Booking Item 3 */}
                    <div className="list-group-item border-0 p-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-info d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <span className="text-white fw-bold">SH</span>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="fw-bold">Hair Cut & Style</div>
                          <div className="text-muted small">Spa Heaven</div>
                        </div>
                        <div className="text-success fw-bold">₹400</div>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 text-center">
                    <button className="btn btn-link text-decoration-none">
                      See all appointments <FaChevronRight className="ms-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* New Salon Requests */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">New Salon Request</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {/* Request Item 1 */}
                    <div className="list-group-item border-0 p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <span className="text-white fw-bold">TBL</span>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <div className="fw-bold">The Beauty Lounge</div>
                            <div className="text-muted small">Premium Plan Request</div>
                          </div>
                        </div>
                        <button className="btn btn-outline-primary btn-sm">Review</button>
                      </div>
                    </div>

                    {/* Request Item 2 */}
                    <div className="list-group-item border-0 p-3 bg-light bg-opacity-50">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <span className="text-white fw-bold">TBL</span>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <div className="fw-bold">The Beauty Lounge</div>
                            <div className="text-muted small">Premium Plan Request</div>
                          </div>
                        </div>
                        <button className="btn btn-outline-primary btn-sm">Review</button>
                      </div>
                    </div>

                    {/* Request Item 3 */}
                    <div className="list-group-item border-0 p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="rounded-circle bg-info d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <span className="text-white fw-bold">TBL</span>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <div className="fw-bold">The Beauty Lounge</div>
                            <div className="text-muted small">Premium Plan Request</div>
                          </div>
                        </div>
                        <button className="btn btn-outline-primary btn-sm">Review</button>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 text-center">
                    <button className="btn btn-link text-decoration-none">
                      See all requests <FaChevronRight className="ms-1" />
                    </button>
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

export default Dashboard;
