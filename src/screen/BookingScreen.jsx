import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const BookingScreen = () => {
  const { user, is_verified } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock booking data
  const [bookings, setBookings] = useState([
    {
      id: 1,
      customerName: "Priya Sharma",
      customerPhone: "+91 98765 43210",
      salonName: "The Beauty Lounge",
      service: "Haircut & Styling",
      date: "2024-01-15",
      time: "14:00",
      status: "Confirmed",
      amount: "₹1,200",
      paymentStatus: "Paid"
    },
    {
      id: 2,
      customerName: "Rahul Kumar",
      customerPhone: "+91 87654 32109",
      salonName: "Glamour Studio",
      service: "Facial Treatment",
      date: "2024-01-15",
      time: "16:30",
      status: "Pending",
      amount: "₹800",
      paymentStatus: "Pending"
    },
    {
      id: 3,
      customerName: "Anjali Patel",
      customerPhone: "+91 76543 21098",
      salonName: "Elegance Salon",
      service: "Bridal Makeup",
      date: "2024-01-16",
      time: "10:00",
      status: "Confirmed",
      amount: "₹5,000",
      paymentStatus: "Paid"
    },
    {
      id: 4,
      customerName: "Vikram Singh",
      customerPhone: "+91 65432 10987",
      salonName: "Style Hub",
      service: "Hair Coloring",
      date: "2024-01-16",
      time: "12:00",
      status: "Cancelled",
      amount: "₹2,500",
      paymentStatus: "Refunded"
    },
    {
      id: 5,
      customerName: "Meera Reddy",
      customerPhone: "+91 54321 09876",
      salonName: "Luxe Beauty",
      service: "Manicure & Pedicure",
      date: "2024-01-17",
      time: "15:00",
      status: "Confirmed",
      amount: "₹600",
      paymentStatus: "Paid"
    }
  ]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    return statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'refunded':
        return 'text-info';
      default:
        return 'text-secondary';
    }
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
                    Booking Management
                  </h2>
                  <p className="text-muted mb-0">Manage all salon bookings and appointments</p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#667eea',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  New Booking
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{bookings.length}</h4>
                      <p className="mb-0">Total Bookings</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar-check fa-2x"></i>
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
                      <h4 className="mb-0">{bookings.filter(b => b.status === 'Confirmed').length}</h4>
                      <p className="mb-0">Confirmed</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
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
                      <h4 className="mb-0">{bookings.filter(b => b.status === 'Pending').length}</h4>
                      <p className="mb-0">Pending</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
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
                      <h4 className="mb-0">₹{bookings.reduce((sum, b) => sum + parseInt(b.amount.replace('₹', '').replace(',', '')), 0).toLocaleString()}</h4>
                      <p className="mb-0">Total Revenue</p>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-rupee-sign fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Filter by date"
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setStatusFilter('all')}
                      >
                        <i className="fas fa-refresh me-2"></i>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>CUSTOMER</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>SALON & SERVICE</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>DATE & TIME</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>STATUS</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>AMOUNT</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBookings.map((booking) => (
                          <tr key={booking.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div>
                                <div style={{ fontWeight: '600', color: '#2c3e50' }}>{booking.customerName}</div>
                                <small className="text-muted">{booking.customerPhone}</small>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div>
                                <div style={{ fontWeight: '500', color: '#2c3e50' }}>{booking.salonName}</div>
                                <small className="text-muted">{booking.service}</small>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div>
                                <div style={{ fontWeight: '500', color: '#2c3e50' }}>{new Date(booking.date).toLocaleDateString()}</div>
                                <small className="text-muted">{booking.time}</small>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div>
                                <div style={{ fontWeight: '600', color: '#2c3e50' }}>{booking.amount}</div>
                                <small className={getPaymentStatusClass(booking.paymentStatus)}>
                                  {booking.paymentStatus}
                                </small>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                  onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                  onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} results
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        &gt;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingScreen;
