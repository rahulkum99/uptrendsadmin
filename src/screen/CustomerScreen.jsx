import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  useGetCustomersQuery, 
  useDeleteCustomerMutation 
} from '../redux/api/customerApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
  FaVenus,
  FaMars,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';

const CustomerScreen = () => {
  console.log('CustomerScreen component mounted/re-rendered');
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'M', 'F', 'O'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // RTK Query hooks
  const { 
    data: customerResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetCustomersQuery({
    page: currentPage,
    limit: pageSize
  }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Extract customers from paginated response
  const customers = customerResponse?.results || customerResponse || [];
  const pagination = customerResponse?.results ? {
    count: customerResponse.count,
    totalPages: customerResponse.total_pages,
    next: customerResponse.next,
    previous: customerResponse.previous
  } : null;

  const [deleteCustomer, { isLoading: isDeletingCustomer }] = useDeleteCustomerMutation();

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        customer.first_name?.toLowerCase().includes(searchLower) ||
        customer.last_name?.toLowerCase().includes(searchLower) ||
        customer.user_phone_number?.includes(searchTerm) ||
        customer.user_email?.toLowerCase().includes(searchLower);

      // Gender filter
      const matchesGender = genderFilter === 'all' || customer.gender === genderFilter;

      // Active status filter
      const matchesActive = activeFilter === 'all' ||
        (activeFilter === 'active' && customer.is_active !== false) ||
        (activeFilter === 'inactive' && customer.is_active === false);

      return matchesSearch && matchesGender && matchesActive;
    });
  }, [customers, searchTerm, genderFilter, activeFilter]);

  // Handle customer deletion
  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Are you sure you want to delete customer ${customer.first_name} ${customer.last_name}?`)) {
      try {
        await deleteCustomer(customer.user_phone_number).unwrap();
        toast.success('Customer deleted successfully!');
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setActiveFilter('all');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Calculate pagination info
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || customers.length) / pageSize);
  const hasNextPage = pagination?.next !== null;
  const hasPrevPage = pagination?.previous !== null;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Get customer display name
  const getCustomerName = (customer) => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    return fullName || 'Unnamed Customer';
  };

  // Get gender display
  const getGenderDisplay = (gender) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'Not specified';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    // Use total count from API if available, otherwise use local count
    const total = pagination?.count || customers.length;
    const active = customers.filter(c => c.is_active !== false).length;
    const withProfiles = customers.filter(c => c.first_name && c.last_name).length;
    const withProfilePictures = customers.filter(c => c.profile_picture).length;
    const withContact = customers.filter(c => c.user_phone_number || c.user_email).length;
    const withBirthday = customers.filter(c => c.date_of_birth).length;
    
    return { total, active, withProfiles, withProfilePictures, withContact, withBirthday };
  }, [customers, pagination]);

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
                <span className="visually-hidden">Loading customers...</span>
              </div>
              <h5 className="text-muted">Loading customers...</h5>
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
              <FaUsers size={48} className="text-danger mb-3" />
              <h4 className="alert-heading">Error Loading Customers</h4>
              <p className="mb-3">{error.data?.detail || 'Failed to load customer data'}</p>
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
          .customer-row:hover {
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
                    Customer Management
                  </h2>
                  <p className="text-muted mb-0">Manage and view customer details</p>
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
                      <small>Total Customers</small>
                    </div>
                    <div className="align-self-center">
                      <FaUsers size={20} />
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
                      <h4 className="mb-0">{stats.active}</h4>
                      <small>Active</small>
                    </div>
                    <div className="align-self-center">
                      <FaUserCheck size={20} />
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
                      <h4 className="mb-0">{stats.withProfiles}</h4>
                      <small>Complete Profiles</small>
                    </div>
                    <div className="align-self-center">
                      <FaUser size={20} />
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
                      <h4 className="mb-0">{stats.withContact}</h4>
                      <small>With Contact</small>
                    </div>
                    <div className="align-self-center">
                      <FaPhone size={20} />
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
                      <h4 className="mb-0">{stats.withProfilePictures}</h4>
                      <small>With Pictures</small>
                    </div>
                    <div className="align-self-center">
                      <FaUser size={20} />
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
                      <h4 className="mb-0">{stats.withBirthday}</h4>
                      <small>With Birthday</small>
                    </div>
                    <div className="align-self-center">
                      <FaCalendarAlt size={20} />
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
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search customers by name, phone, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ border: '1px solid #dee2e6' }}
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        style={{ border: '1px solid #dee2e6' }}
                      >
                        <option value="all">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        style={{ border: '1px solid #dee2e6' }}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={clearFilters}
                      >
                        <FaFilter className="me-2" />
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer List */}
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
                        <FaUsers size={20} />
                      </div>
                      <div>
                        <h5 className="mb-0" style={{ fontWeight: '700', fontSize: '18px' }}>Customer List</h5>
                        <small className="opacity-75" style={{ fontSize: '13px' }}>Manage your customers</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                      {pagination && (
                        <div className="text-center">
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>{pagination.count}</div>
                          <small className="opacity-75" style={{ fontSize: '11px' }}>Total Customers</small>
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
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-5">
                      <FaUsers size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No customers found</h5>
                      <p className="text-muted">
                        {searchTerm || activeFilter !== 'all' || genderFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No customers available'
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
                                <FaUser className="me-2" size={16} />
                                Customer Profile
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaUser className="me-2" size={16} />
                                Name & Bio
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaPhone className="me-2" size={16} />
                                Contact Info
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaCalendarAlt className="me-2" size={16} />
                                Personal Info
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaCheckCircle className="me-2" size={16} />
                                Status
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.map((customer, index) => (
                            <tr
                              key={customer.user_phone_number || index}
                              style={{
                                borderBottom: '1px solid #f1f3f4',
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                transition: 'all 0.2s ease-in-out'
                              }}
                              className="customer-row"
                            >
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex align-items-center">
                                  {customer.profile_picture ? (
                                    <img
                                      src={customer.profile_picture}
                                      alt="Profile"
                                      className="rounded-circle me-3 shadow-sm"
                                      style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover',
                                        border: '3px solid #fff',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : 
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      fontSize: '18px',
                                      fontWeight: '700',
                                      background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                                      color: 'white',
                                      border: '3px solid #fff',
                                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                      display: customer.profile_picture ? 'none' : 'flex'
                                    }}
                                  >
                                    {getCustomerName(customer).charAt(0).toUpperCase()}
                                  </div>
                                  }
                                  
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '16px', marginBottom: '4px' }}>
                                    {getCustomerName(customer)}
                                  </div>
                                  {customer.bio && (
                                    <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.3', display: 'block' }}>
                                      {customer.bio.length > 60 ? `${customer.bio.substring(0, 60)}...` : customer.bio}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex flex-column gap-2">
                                  {customer.user_phone_number && (
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: '#e8f5e8',
                                          color: '#2e7d32'
                                        }}
                                      >
                                        <FaPhone size={10} />
                                      </div>
                                      <small style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                        {customer.user_phone_number}
                                      </small>
                                    </div>
                                  )}
                                  {customer.user_email && (
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: '#fff3e0',
                                          color: '#f57c00'
                                        }}
                                      >
                                        <FaEnvelope size={10} />
                                      </div>
                                      <small style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                        {customer.user_email}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex flex-column gap-2">
                                  {customer.date_of_birth && (
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: '#e3f2fd',
                                          color: '#1976d2'
                                        }}
                                      >
                                        <FaBirthdayCake size={10} />
                                      </div>
                                      <small style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                        {new Date(customer.date_of_birth).toLocaleDateString()}
                                      </small>
                                    </div>
                                  )}
                                  {customer.gender && (
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: customer.gender === 'M' ? '#e3f2fd' : customer.gender === 'F' ? '#fce4ec' : '#f3e5f5',
                                          color: customer.gender === 'M' ? '#1976d2' : customer.gender === 'F' ? '#c2185b' : '#7b1fa2'
                                        }}
                                      >
                                        {customer.gender === 'M' ? <FaMars size={10} /> : 
                                         customer.gender === 'F' ? <FaVenus size={10} /> : 
                                         <span style={{fontSize: '8px'}}>⚧</span>}
                                      </div>
                                      <small style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                        {getGenderDisplay(customer.gender)}
                                      </small>
                                    </div>
                                  )}
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
                                      backgroundColor: customer.is_active !== false ? '#e8f5e8' : '#f5f5f5',
                                      color: customer.is_active !== false ? '#2e7d32' : '#757575',
                                      border: `2px solid ${customer.is_active !== false ? '#4caf50' : '#bdbdbd'}`
                                    }}
                                  >
                                    <div
                                      className="rounded-circle"
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: customer.is_active !== false ? '#4caf50' : '#bdbdbd'
                                      }}
                                    ></div>
                                    {customer.is_active !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    onClick={() => setSelectedCustomer(customer)}
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
                                  <button
                                    onClick={() => handleDeleteCustomer(customer)}
                                    disabled={isDeletingCustomer}
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
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
                          <nav aria-label="Customer pagination">
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
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination?.count || customers.length)} of {pagination?.count || customers.length} customers
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none'
              }}>
                <div className="d-flex align-items-center">
                  {selectedCustomer.profile_picture ? (
                    <img
                      src={selectedCustomer.profile_picture}
                      alt="Profile"
                      className="rounded-circle me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover',
                        border: '2px solid rgba(255, 255, 255, 0.3)'
                      }}
                    />
                  ) : (
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
                      {getCustomerName(selectedCustomer).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="modal-title mb-0">{getCustomerName(selectedCustomer)}</h5>
                    <small className="opacity-75">Customer Details</small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCustomer(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Contact Information</h6>
                    {selectedCustomer.user_phone_number && (
                      <div className="mb-3">
                        <strong>Phone:</strong> {selectedCustomer.user_phone_number}
                      </div>
                    )}
                    {selectedCustomer.user_email && (
                      <div className="mb-3">
                        <strong>Email:</strong> {selectedCustomer.user_email}
                      </div>
                    )}
                    {selectedCustomer.prefred_phone_number && (
                      <div className="mb-3">
                        <strong>Preferred Phone:</strong> {selectedCustomer.prefred_phone_number}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${selectedCustomer.is_active !== false ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedCustomer.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Personal Information</h6>
                    {selectedCustomer.date_of_birth && (
                      <div className="mb-3">
                        <strong>Date of Birth:</strong> {new Date(selectedCustomer.date_of_birth).toLocaleDateString()}
                      </div>
                    )}
                    {selectedCustomer.gender && (
                      <div className="mb-3">
                        <strong>Gender:</strong> {getGenderDisplay(selectedCustomer.gender)}
                      </div>
                    )}
                    {selectedCustomer.bio && (
                      <div className="mb-3">
                        <strong>Bio:</strong>
                        <p className="mt-2 text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {selectedCustomer.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default CustomerScreen;
