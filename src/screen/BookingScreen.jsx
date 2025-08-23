import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  useGetBookingsQuery, 
  useUpdateBookingStatusMutation, 
  useDeleteBookingMutation 
} from '../redux/api/bookingApi';
import { toast } from 'react-toastify';
import {
  FaCalendarCheck,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock as FaTime,
  FaRupeeSign,
  FaEye,
  FaEdit,
  FaTrash,
  FaStore,
  FaUsers,
  FaCreditCard,
  FaReceipt
} from 'react-icons/fa';

const BookingScreen = () => {
  console.log('BookingScreen component mounted/re-rendered');
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // RTK Query hooks
  const { 
    data: bookingResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetBookingsQuery({
    page: currentPage,
    limit: pageSize
  }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Extract bookings from paginated response
  const bookings = bookingResponse?.results || [];
  const pagination = bookingResponse?.results ? {
    count: bookingResponse.count,
    totalPages: bookingResponse.total_pages,
    next: bookingResponse.next,
    previous: bookingResponse.previous
  } : null;

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        booking.invoice_no?.toLowerCase().includes(searchLower) ||
        booking.user_full_name?.toLowerCase().includes(searchLower) ||
        booking.user_phone_number?.includes(searchTerm) ||
        booking.user_email?.toLowerCase().includes(searchLower) ||
        booking.shop?.service_name?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.order_status === statusFilter;

      // Payment filter
      const matchesPayment = paymentFilter === 'all' || 
        (paymentFilter === 'paid' && booking.is_paid) ||
        (paymentFilter === 'unpaid' && !booking.is_paid);

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  // Handle booking status update
  const handleStatusUpdate = async (booking, newStatus) => {
    try {
      await updateBookingStatus({
        uid: booking.uid,
        order_status: newStatus
      }).unwrap();
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (booking) => {
    if (window.confirm(`Are you sure you want to delete booking ${booking.invoice_no}?`)) {
      try {
        await deleteBooking(booking.uid).unwrap();
        toast.success('Booking deleted successfully!');
        setSelectedBooking(null);
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking');
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Calculate pagination info
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || bookings.length) / pageSize);
  const hasNextPage = pagination?.next !== null;
  const hasPrevPage = pagination?.previous !== null;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Get customer display info
  const getCustomerInfo = (booking) => {
    if (booking.booking_persion && booking.booking_persion_phone_number) {
      return {
        name: booking.booking_persion,
        phone: booking.booking_persion_phone_number,
        email: null
      };
    } else {
      return {
        name: booking.user_full_name || 'Unknown Customer',
        phone: booking.user_phone_number,
        email: booking.user_email
      };
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  // Get payment status class
  const getPaymentStatusClass = (isPaid) => {
    return isPaid ? 'text-success' : 'text-warning';
  };

  // Statistics
  const stats = useMemo(() => {
    const total = pagination?.count || bookings.length;
    const confirmed = bookings.filter(b => b.order_status === 'confirmed').length;
    const pending = bookings.filter(b => b.order_status === 'pending').length;
    const completed = bookings.filter(b => b.order_status === 'completed').length;
    const paid = bookings.filter(b => b.is_paid).length;
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    
    return { total, confirmed, pending, completed, paid, totalRevenue };
  }, [bookings, pagination]);

  if (isLoading) {
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
          <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading bookings...</span>
              </div>
              <h5 className="text-muted">Loading bookings...</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="alert alert-danger text-center" role="alert" style={{ maxWidth: '500px' }}>
              <FaCalendarCheck size={48} className="text-danger mb-3" />
              <h4 className="alert-heading">Error Loading Bookings</h4>
              <p className="mb-3">{error.data?.detail || 'Failed to load booking data'}</p>
              <button className="btn btn-outline-danger" onClick={() => refetch()}>
                <FaSpinner className="me-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      margin: 0,
      padding: 0,
      width: '100vw',
      overflow: 'hidden'
    }}>
      <style>
        {`
          .booking-row:hover {
            background-color: #f8f9fa !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }
          
          .table {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          
          .table thead th {
            position: sticky;
            top: 0;
            z-index: 10;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          
          .table tbody tr {
            transition: all 0.3s ease;
          }
          
          .table tbody tr:hover {
            background-color: #f8f9fa !important;
          }
          
          .badge {
            transition: all 0.2s ease;
          }
          
          .badge:hover {
            transform: scale(1.05);
          }
          
          .btn {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .btn:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
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
                  onClick={() => refetch()}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#667eea',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  <FaSpinner className={`me-2 ${isLoading ? 'fa-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.total}</h4>
                      <small>Total Bookings</small>
                    </div>
                    <div className="align-self-center">
                      <FaCalendarCheck size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.confirmed}</h4>
                      <small>Confirmed</small>
                    </div>
                    <div className="align-self-center">
                      <FaCheckCircle size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.pending}</h4>
                      <small>Pending</small>
                    </div>
                    <div className="align-self-center">
                      <FaClock size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.completed}</h4>
                      <small>Completed</small>
                    </div>
                    <div className="align-self-center">
                      <FaCheckCircle size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-secondary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.paid}</h4>
                      <small>Paid</small>
                    </div>
                    <div className="align-self-center">
                      <FaCreditCard size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-dark text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">₹{stats.totalRevenue.toLocaleString()}</h4>
                      <small>Total Revenue</small>
                    </div>
                    <div className="align-self-center">
                      <FaRupeeSign size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by invoice, customer, or salon..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ border: '1px solid #dee2e6' }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ border: '1px solid #dee2e6' }}
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        style={{ border: '1px solid #dee2e6' }}
                      >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={clearFilters}
                      >
                        <FaFilter className="me-2" />
                        Reset
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
              <div className="card" style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <div className="card-header" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 25px'
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaCalendarCheck size={20} />
                      </div>
                      <div>
                        <h5 className="mb-0" style={{ fontWeight: '700', fontSize: '18px' }}>Booking List</h5>
                        <small className="opacity-75" style={{ fontSize: '13px' }}>Manage your salon bookings</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                      {pagination && (
                        <div className="text-center">
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>{pagination.count}</div>
                          <small className="opacity-75" style={{ fontSize: '11px' }}>Total Bookings</small>
                        </div>
                      )}
                      {totalPages > 1 && (
                        <div className="text-center">
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>{currentPage}/{totalPages}</div>
                          <small className="opacity-75" style={{ fontSize: '11px' }}>Pages</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCalendarCheck size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No bookings found</h5>
                      <p className="text-muted">
                        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No bookings available'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaReceipt className="me-2" size={16} />
                                Invoice & Customer
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaStore className="me-2" size={16} />
                                Salon & Services
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaCalendarAlt className="me-2" size={16} />
                                Visit Details
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaCheckCircle className="me-2" size={16} />
                                Status
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaRupeeSign className="me-2" size={16} />
                                Amount
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((booking, index) => {
                            const customerInfo = getCustomerInfo(booking);
                            return (
                              <tr
                                key={booking.uid}
                                style={{
                                  borderBottom: '1px solid #f1f3f4',
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                  transition: 'all 0.2s ease-in-out'
                                }}
                                className="booking-row"
                              >
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div>
                                    <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '14px', marginBottom: '4px' }}>
                                      {booking.invoice_no}
                                    </div>
                                    <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '13px', marginBottom: '2px' }}>
                                      {customerInfo.name}
                                    </div>
                                    <div className="d-flex flex-column gap-1">
                                      {customerInfo.phone && (
                                        <small className="text-muted" style={{ fontSize: '11px' }}>
                                          <FaPhone size={8} className="me-1" />
                                          {customerInfo.phone}
                                        </small>
                                      )}
                                      {customerInfo.email && (
                                        <small className="text-muted" style={{ fontSize: '11px' }}>
                                          <FaEnvelope size={8} className="me-1" />
                                          {customerInfo.email}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '13px', marginBottom: '4px' }}>
                                      {booking.shop?.service_name}
                                    </div>
                                    <div className="d-flex flex-column gap-1">
                                      {booking.order_items?.map((item, idx) => (
                                        <small key={idx} className="text-muted" style={{ fontSize: '11px' }}>
                                          • {item.service_name || 'Service'} - ₹{item.price}
                                        </small>
                                      ))}
                                    </div>
                                    {booking.order_staff_info?.length > 0 && (
                                      <small className="text-muted" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                        <FaUser size={8} className="me-1" />
                                        Staff: {booking.order_staff_info[0]?.staff_name}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '13px', marginBottom: '4px' }}>
                                      {new Date(booking.visit_date).toLocaleDateString()}
                                    </div>
                                    <div className="d-flex flex-column gap-1">
                                      <small className="text-muted" style={{ fontSize: '11px' }}>
                                        <FaTime size={8} className="me-1" />
                                        {booking.visit_time}
                                      </small>
                                      <small className="text-muted" style={{ fontSize: '11px' }}>
                                        Duration: {booking.total_duration}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div className="d-flex justify-content-center">
                                    <span
                                      className={`badge d-flex align-items-center gap-1`}
                                      style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: booking.order_status === 'confirmed' ? '#e8f5e8' : 
                                                       booking.order_status === 'pending' ? '#fff3e0' :
                                                       booking.order_status === 'completed' ? '#e3f2fd' :
                                                       booking.order_status === 'cancelled' ? '#ffebee' : '#f5f5f5',
                                        color: booking.order_status === 'confirmed' ? '#2e7d32' :
                                              booking.order_status === 'pending' ? '#f57c00' :
                                              booking.order_status === 'completed' ? '#1976d2' :
                                              booking.order_status === 'cancelled' ? '#c62828' : '#757575',
                                        border: `2px solid ${booking.order_status === 'confirmed' ? '#4caf50' :
                                                          booking.order_status === 'pending' ? '#ff9800' :
                                                          booking.order_status === 'completed' ? '#2196f3' :
                                                          booking.order_status === 'cancelled' ? '#f44336' : '#bdbdbd'}`
                                      }}
                                    >
                                      <div
                                        className="rounded-circle"
                                        style={{
                                          width: '8px',
                                          height: '8px',
                                          backgroundColor: booking.order_status === 'confirmed' ? '#4caf50' :
                                                         booking.order_status === 'pending' ? '#ff9800' :
                                                         booking.order_status === 'completed' ? '#2196f3' :
                                                         booking.order_status === 'cancelled' ? '#f44336' : '#bdbdbd'
                                        }}
                                      ></div>
                                      {booking.order_status?.charAt(0).toUpperCase() + booking.order_status?.slice(1)}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div>
                                    <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '14px', marginBottom: '2px' }}>
                                      ₹{parseFloat(booking.total_price).toLocaleString()}
                                    </div>
                                    <small className={getPaymentStatusClass(booking.is_paid)} style={{ fontSize: '11px' }}>
                                      {booking.is_paid ? 'Paid' : 'Unpaid'}
                                    </small>
                                    {booking.discount && parseFloat(booking.discount) > 0 && (
                                      <small className="text-success" style={{ fontSize: '11px', display: 'block' }}>
                                        Discount: ₹{booking.discount}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div className="d-flex justify-content-center gap-1">
                                    <button
                                      onClick={() => setSelectedBooking(booking)}
                                      className="btn btn-sm"
                                      style={{
                                        backgroundColor: '#e3f2fd',
                                        border: '1px solid #bbdefb',
                                        color: '#1976d2',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#bbdefb';
                                        e.target.style.transform = 'translateY(-1px)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#e3f2fd';
                                        e.target.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <FaEye size={10} className="me-1" />
                                      View
                                    </button>
                                    {/* <button
                                      onClick={() => handleStatusUpdate(booking, 'confirmed')}
                                      className="btn btn-sm"
                                      style={{
                                        backgroundColor: '#e8f5e8',
                                        border: '1px solid #c8e6c9',
                                        color: '#2e7d32',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#c8e6c9';
                                        e.target.style.transform = 'translateY(-1px)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#e8f5e8';
                                        e.target.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <FaCheckCircle size={10} className="me-1" />
                                      Confirm
                                    </button> */}
                                    {/* <button
                                      onClick={() => handleDeleteBooking(booking)}
                                      className="btn btn-sm"
                                      style={{
                                        backgroundColor: '#ffebee',
                                        border: '1px solid #ffcdd2',
                                        color: '#c62828',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#ffcdd2';
                                        e.target.style.transform = 'translateY(-1px)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#ffebee';
                                        e.target.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <FaTrash size={10} />
                                    </button> */}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="card-footer">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3">
                            <span className="text-muted">Show:</span>
                            <select
                              className="form-select form-select-sm"
                              style={{ width: 'auto' }}
                              value={pageSize}
                              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                            </select>
                            <span className="text-muted">per page</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <nav aria-label="Booking pagination">
                            <ul className="pagination pagination-sm justify-content-end mb-0">
                              {/* Previous button */}
                              <li className={`page-item ${!hasPrevPage ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  disabled={!hasPrevPage}
                                >
                                  Previous
                                </button>
                              </li>
                              
                              {/* Page numbers */}
                              {Array.from({ length: totalPages }, (_, index) => {
                                const page = index + 1;
                                const showPage = 
                                  page === 1 || 
                                  page === totalPages || 
                                  (page >= currentPage - 2 && page <= currentPage + 2);
                                
                                if (!showPage) {
                                  if (page === currentPage - 3 || page === currentPage + 3) {
                                    return (
                                      <li key={page} className="page-item disabled">
                                        <span className="page-link">...</span>
                                      </li>
                                    );
                                  }
                                  return null;
                                }
                                
                                return (
                                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                    <button
                                      className="page-link"
                                      onClick={() => handlePageChange(page)}
                                    >
                                      {page}
                                    </button>
                                  </li>
                                );
                              })}
                              
                              {/* Next button */}
                              <li className={`page-item ${!hasNextPage ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={!hasNextPage}
                                >
                                  Next
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                      
                      {/* Pagination info */}
                      <div className="row mt-2">
                        <div className="col-12 text-center">
                          <small className="text-muted">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination?.count || bookings.length)} of {pagination?.count || bookings.length} bookings
                            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none'
              }}>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '18px',
                      fontWeight: '700',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <FaReceipt size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{selectedBooking.invoice_no}</h5>
                    <small className="opacity-75">Booking Details</small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Customer Information</h6>
                    <div className="mb-3">
                      <strong>Name:</strong> {getCustomerInfo(selectedBooking).name}
                    </div>
                    {getCustomerInfo(selectedBooking).phone && (
                      <div className="mb-3">
                        <strong>Phone:</strong> {getCustomerInfo(selectedBooking).phone}
                      </div>
                    )}
                    {getCustomerInfo(selectedBooking).email && (
                      <div className="mb-3">
                        <strong>Email:</strong> {getCustomerInfo(selectedBooking).email}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${getStatusBadgeClass(selectedBooking.order_status)}`}>
                        {selectedBooking.order_status?.charAt(0).toUpperCase() + selectedBooking.order_status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Booking Information</h6>
                    <div className="mb-3">
                      <strong>Visit Date:</strong> {new Date(selectedBooking.visit_date).toLocaleDateString()}
                    </div>
                    <div className="mb-3">
                      <strong>Visit Time:</strong> {selectedBooking.visit_time}
                    </div>
                    <div className="mb-3">
                      <strong>Total Duration:</strong> {selectedBooking.total_duration}
                    </div>
                    <div className="mb-3">
                      <strong>Payment Status:</strong>
                      <span className={`badge ms-2 ${selectedBooking.is_paid ? 'bg-success' : 'bg-warning'}`}>
                        {selectedBooking.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-12">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Salon Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Salon Name:</strong> {selectedBooking.shop?.service_name}
                        </div>
                        <div className="mb-2">
                          <strong>Established:</strong> {selectedBooking.shop?.established_year}
                        </div>
                        {selectedBooking.order_staff_info?.length > 0 && (
                          <div className="mb-2">
                            <strong>Assigned Staff:</strong> {selectedBooking.order_staff_info[0]?.staff_name}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Total Amount:</strong> ₹{parseFloat(selectedBooking.total_price).toLocaleString()}
                        </div>
                        {selectedBooking.discount && parseFloat(selectedBooking.discount) > 0 && (
                          <div className="mb-2">
                            <strong>Discount:</strong> ₹{selectedBooking.discount}
                          </div>
                        )}
                        {selectedBooking.coupon && (
                          <div className="mb-2">
                            <strong>Coupon Used:</strong> {selectedBooking.coupon}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-12">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Services Booked</h6>
                    <div className="row">
                      {selectedBooking.order_items?.map((item, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <h6 className="mb-1" style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {item.service_name || 'Service'}
                              </h6>
                              <div className="d-flex justify-content-between">
                                <small className="text-muted">Duration: {item.duration}</small>
                                <strong className="text-primary">₹{item.price}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => handleStatusUpdate(selectedBooking, 'confirmed')}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingScreen;
