import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  useGetPartnersInReviewQuery, 
  useUpdatePartnerStatusMutation,
  useDeletePartnerReviewMutation
} from '../redux/api/partnerReviewApi';
import { toast } from 'react-toastify';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaStore,
  FaClock,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa';

const PartnerReviewScreen = () => {
  console.log('PartnerReviewScreen component mounted/re-rendered');
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // RTK Query hooks
  const { 
    data: partnerResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetPartnersInReviewQuery({
    page: currentPage,
    limit: pageSize
  }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Extract partners from paginated response
  const partners = partnerResponse?.results || [];
  const pagination = partnerResponse?.results ? {
    count: partnerResponse.count,
    totalPages: partnerResponse.total_pages,
    next: partnerResponse.next,
    previous: partnerResponse.previous
  } : null;

  // Helper function to get basic info from partner
  const getBasicInfo = (partner) => {
    return partner.shop_basic_info || partner;
  };

  const [updatePartnerStatus] = useUpdatePartnerStatusMutation();
  const [deletePartner] = useDeletePartnerReviewMutation();

  // Filter partners based on search and filters
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const basicInfo = getBasicInfo(partner);
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        basicInfo.service_name?.toLowerCase().includes(searchLower) ||
        basicInfo.contact_number?.includes(searchTerm) ||
        basicInfo.email?.toLowerCase().includes(searchLower) ||
        basicInfo.city?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'verified' && basicInfo.is_verified) ||
        (statusFilter === 'unverified' && !basicInfo.is_verified);

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchTerm, statusFilter]);

  // Handle partner approval
  const handleApprovePartner = async (partner) => {
    try {
      const basicInfo = getBasicInfo(partner);
      await updatePartnerStatus({
        action: 'approve',
        shop_uid: partner.uid
      }).unwrap();
      toast.success(`${basicInfo.service_name} approved successfully!`);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error approving partner:', error);
      toast.error('Failed to approve partner');
    }
  };

  // Handle partner rejection
  const handleRejectPartner = async (partner) => {
    try {
      const basicInfo = getBasicInfo(partner);
      await updatePartnerStatus({
        action: 'reject',
        shop_uid: partner.uid
      }).unwrap();
      toast.success(`${basicInfo.service_name} rejected successfully!`);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error rejecting partner:', error);
      toast.error('Failed to reject partner');
    }
  };

  // Handle partner deletion
  const handleDeletePartner = async (partner) => {
    const basicInfo = getBasicInfo(partner);
    if (window.confirm(`Are you sure you want to delete ${basicInfo.service_name}?`)) {
      try {
        await deletePartner(partner.uid).unwrap();
        toast.success('Partner deleted successfully!');
        setSelectedPartner(null);
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast.error('Failed to delete partner');
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
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
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || partners.length) / pageSize);
  const hasNextPage = pagination?.next !== null;
  const hasPrevPage = pagination?.previous !== null;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = pagination?.count || partners.length;
    const verified = partners.filter(p => getBasicInfo(p).is_verified).length;
    const unverified = partners.filter(p => !getBasicInfo(p).is_verified).length;
    const active = partners.filter(p => getBasicInfo(p).is_active).length;
    const withContact = partners.filter(p => {
      const basicInfo = getBasicInfo(p);
      return basicInfo.contact_number || basicInfo.email;
    }).length;
    const withLocation = partners.filter(p => {
      const basicInfo = getBasicInfo(p);
      return basicInfo.latitude && basicInfo.longitude;
    }).length;
    
    return { total, verified, unverified, active, withContact, withLocation };
  }, [partners, pagination]);

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
                <span className="visually-hidden">Loading partners...</span>
              </div>
              <h5 className="text-muted">Loading partners for review...</h5>
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
              <FaExclamationTriangle size={48} className="text-danger mb-3" />
              <h4 className="alert-heading">Error Loading Partners</h4>
              <p className="mb-3">{error.data?.detail || 'Failed to load partner review data'}</p>
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
                    Partner Review Management
                  </h2>
                  <p className="text-muted mb-0">Review and approve new partner applications</p>
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
                      <small>Total Pending</small>
                    </div>
                    <div className="align-self-center">
                      <FaClock size={20} />
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
                      <h4 className="mb-0">{stats.verified}</h4>
                      <small>Verified</small>
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
                      <h4 className="mb-0">{stats.unverified}</h4>
                      <small>Unverified</small>
                    </div>
                    <div className="align-self-center">
                      <FaExclamationTriangle size={20} />
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
                      <h4 className="mb-0">{stats.active}</h4>
                      <small>Active</small>
                    </div>
                    <div className="align-self-center">
                      <FaUsers size={20} />
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
              <div className="card bg-dark text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.withLocation}</h4>
                      <small>With Location</small>
                    </div>
                    <div className="align-self-center">
                      <FaMapMarkerAlt size={20} />
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
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search partners by name, contact, or location..."
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
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>
                    <div className="col-md-3">
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

          {/* Partners Table */}
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
                        <h5 className="mb-0" style={{ fontWeight: '700', fontSize: '18px' }}>Partner Review List</h5>
                        <small className="opacity-75" style={{ fontSize: '13px' }}>Review pending partner applications</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                      {pagination && (
                        <div className="text-center">
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>{pagination.count}</div>
                          <small className="opacity-75" style={{ fontSize: '11px' }}>Pending Reviews</small>
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
                  {filteredPartners.length === 0 ? (
                    <div className="text-center py-5">
                      <FaUsers size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No partners found for review</h5>
                      <p className="text-muted">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No pending partner applications'
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
                                <FaStore className="me-2" size={16} />
                                Partner Details
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaMapMarkerAlt className="me-2" size={16} />
                                Location
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaUsers className="me-2" size={16} />
                                Services
                              </div>
                            </th>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaPhone className="me-2" size={16} />
                                Contact
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
                          {filteredPartners.map((partner, index) => {
                            const basicInfo = getBasicInfo(partner);
                            return (
                              <tr
                                key={partner.uid}
                                style={{
                                  borderBottom: '1px solid #f1f3f4',
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                  transition: 'all 0.2s ease-in-out'
                                }}
                                className="partner-row"
                              >
                                <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                  <div className="d-flex align-items-center">
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
                                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                      }}
                                    >
                                      {basicInfo.service_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '16px', marginBottom: '4px' }}>
                                        {basicInfo.service_name}
                                      </div>
                                      <div className="d-flex align-items-center gap-3 mb-2">
                                        <small className="text-muted" style={{ fontSize: '12px' }}>
                                          <strong>Est.</strong> {basicInfo.established_year}
                                        </small>
                                      </div>
                                      {basicInfo.description && (
                                        <small className="text-muted" style={{ fontSize: '11px', lineHeight: '1.3', display: 'block' }}>
                                          {basicInfo.description.length > 80 ? `${basicInfo.description.substring(0, 80)}...` : basicInfo.description}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div>
                                  <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px', marginBottom: '4px' }}>
                                    {basicInfo.city}, {basicInfo.state}
                                  </div>
                                  <div className="d-flex flex-column gap-1">
                                    {basicInfo.address && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        {basicInfo.address}
                                      </small>
                                    )}
                                    {basicInfo.address2 && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        {basicInfo.address2}
                                      </small>
                                    )}
                                    {basicInfo.landmark && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4', color: '#6c757d' }}>
                                        <strong>Landmark:</strong> {basicInfo.landmark}
                                      </small>
                                    )}
                                    {basicInfo.pincode && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        <strong>PIN:</strong> {basicInfo.pincode}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex flex-column gap-2">
                                  {basicInfo.service_type_display?.map((service, index) => (
                                    <div key={service.uid} className="d-flex align-items-center gap-2">
                                      <div
                                        className="rounded"
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          backgroundImage: `url(${service.category_image})`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          border: '2px solid #e9ecef',
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                      />
                                      <div className="d-flex flex-column">
                                        <span
                                          className="badge"
                                          style={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontSize: '10px',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            border: '1px solid #bbdefb',
                                            marginBottom: '2px'
                                          }}
                                        >
                                          {service.category_name}
                                        </span>
                                        {service.small_desc && (
                                          <small className="text-muted" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                                            {service.small_desc}
                                          </small>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex flex-column gap-2">
                                  {basicInfo.contact_number && (
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
                                        {basicInfo.contact_number}
                                      </small>
                                    </div>
                                  )}
                                  {basicInfo.email && (
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
                                        {basicInfo.email}
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
                                      backgroundColor: basicInfo.is_verified ? '#e8f5e8' : '#fff3e0',
                                      color: basicInfo.is_verified ? '#2e7d32' : '#f57c00',
                                      border: `2px solid ${basicInfo.is_verified ? '#4caf50' : '#ff9800'}`
                                    }}
                                  >
                                    <div
                                      className="rounded-circle"
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: basicInfo.is_verified ? '#4caf50' : '#ff9800'
                                      }}
                                    ></div>
                                    {basicInfo.is_verified ? 'Verified' : 'Pending Review'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    onClick={() => setSelectedPartner(partner)}
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
                                    onClick={() => handleApprovePartner(partner)}
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
                                    <FaCheck size={10} className="me-1" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPartner(partner)}
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
                                    <FaTimes size={10} />
                                  </button>
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
                          <nav aria-label="Partner review pagination">
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
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination?.count || partners.length)} of {pagination?.count || partners.length} partners
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

      {/* Partner Details Modal */}
      {selectedPartner && (
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
                    {getBasicInfo(selectedPartner).service_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{getBasicInfo(selectedPartner).service_name}</h5>
                    <small className="opacity-75">Partner Review Details</small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPartner(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Basic Information</h6>
                    <div className="mb-3">
                      <strong>Partner ID:</strong> {getBasicInfo(selectedPartner).uid}
                    </div>
                    <div className="mb-3">
                      <strong>Established:</strong> {getBasicInfo(selectedPartner).established_year}
                    </div>
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${getBasicInfo(selectedPartner).is_verified ? 'bg-success' : 'bg-warning'}`}>
                        {getBasicInfo(selectedPartner).is_verified ? 'Verified' : 'Pending Review'}
                      </span>
                    </div>
                    {getBasicInfo(selectedPartner).description && (
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="mt-2 text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {getBasicInfo(selectedPartner).description}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Contact Information</h6>
                    {getBasicInfo(selectedPartner).contact_number && (
                      <div className="mb-3">
                        <strong>Phone:</strong> {getBasicInfo(selectedPartner).contact_number}
                      </div>
                    )}
                    {getBasicInfo(selectedPartner).email && (
                      <div className="mb-3">
                        <strong>Email:</strong> {getBasicInfo(selectedPartner).email}
                      </div>
                    )}
                    {getBasicInfo(selectedPartner).latitude && getBasicInfo(selectedPartner).longitude && (
                      <div className="mb-3">
                        <strong>Coordinates:</strong><br />
                        <small className="text-muted">
                          Lat: {parseFloat(getBasicInfo(selectedPartner).latitude).toFixed(6)}<br />
                          Lng: {parseFloat(getBasicInfo(selectedPartner).longitude).toFixed(6)}
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-12">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Location Details</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>City:</strong> {getBasicInfo(selectedPartner).city}
                        </div>
                        <div className="mb-2">
                          <strong>State:</strong> {getBasicInfo(selectedPartner).state}
                        </div>
                        {getBasicInfo(selectedPartner).pincode && (
                          <div className="mb-2">
                            <strong>Pincode:</strong> {getBasicInfo(selectedPartner).pincode}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        {getBasicInfo(selectedPartner).address && (
                          <div className="mb-2">
                            <strong>Address:</strong> {getBasicInfo(selectedPartner).address}
                          </div>
                        )}
                        {getBasicInfo(selectedPartner).address2 && (
                          <div className="mb-2">
                            <strong>Address 2:</strong> {getBasicInfo(selectedPartner).address2}
                          </div>
                        )}
                        {getBasicInfo(selectedPartner).landmark && (
                          <div className="mb-2">
                            <strong>Landmark:</strong> {getBasicInfo(selectedPartner).landmark}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-12">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Services Offered</h6>
                    <div className="row">
                      {getBasicInfo(selectedPartner).service_type_display?.map((service, index) => (
                        <div key={service.uid} className="col-md-6 mb-3">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-2">
                                <div
                                  className="rounded me-3"
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    backgroundImage: `url(${service.category_image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: '2px solid #e9ecef'
                                  }}
                                />
                                <div>
                                  <h6 className="mb-1" style={{ fontWeight: '600', color: '#2c3e50' }}>
                                    {service.category_name}
                                  </h6>
                                  {service.small_desc && (
                                    <small className="text-muted">{service.small_desc}</small>
                                  )}
                                </div>
                              </div>
                              {service.main_desc && (
                                <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                  {service.main_desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                                 {/* Payment Information */}
                 {selectedPartner.payment_info && (
                   <div className="row">
                     <div className="col-12">
                       <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Payment Information</h6>
                       <div className="row">
                         <div className="col-md-6">
                           <div className="mb-2">
                             <strong>Account Holder:</strong> {selectedPartner.payment_info.account_holder_name}
                           </div>
                           <div className="mb-2">
                             <strong>Account Number:</strong> {selectedPartner.payment_info.bank_account_number}
                           </div>
                           <div className="mb-2">
                             <strong>IFSC Code:</strong> {selectedPartner.payment_info.ifsc_code}
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="mb-2">
                             <strong>GST Number:</strong> {selectedPartner.payment_info.gst_number || 'Not provided'}
                             <span className={`badge ms-2 ${selectedPartner.payment_info.is_gst_verified ? 'bg-success' : 'bg-warning'}`}>
                               {selectedPartner.payment_info.is_gst_verified ? 'Verified' : 'Not Verified'}
                             </span>
                           </div>
                           <div className="mb-2">
                             <strong>PAN Number:</strong> {selectedPartner.payment_info.pan_number || 'Not provided'}
                             <span className={`badge ms-2 ${selectedPartner.payment_info.is_pan_verified ? 'bg-success' : 'bg-warning'}`}>
                               {selectedPartner.payment_info.is_pan_verified ? 'Verified' : 'Not Verified'}
                             </span>
                           </div>
                           <div className="mb-2">
                             <strong>Bank Verified:</strong>
                             <span className={`badge ms-2 ${selectedPartner.payment_info.is_bank_verified ? 'bg-success' : 'bg-warning'}`}>
                               {selectedPartner.payment_info.is_bank_verified ? 'Yes' : 'No'}
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Shop Availabilities */}
                 {selectedPartner.shopavailabilities && selectedPartner.shopavailabilities.length > 0 && (
                   <div className="row">
                     <div className="col-12">
                       <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Shop Availability</h6>
                       <div className="row">
                         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                           const availability = selectedPartner.shopavailabilities.find(avail => avail.day === day);
                           return (
                             <div key={day} className="col-md-6 col-lg-3 mb-3">
                               <div className="card border-0 shadow-sm h-100">
                                 <div className="card-body p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-2">
                                     <h6 className="mb-0" style={{ 
                                       fontWeight: '600', 
                                       color: '#2c3e50',
                                       fontSize: '14px'
                                     }}>
                                       {day === 'Sun' ? 'Sunday' :
                                        day === 'Mon' ? 'Monday' :
                                        day === 'Tue' ? 'Tuesday' :
                                        day === 'Wed' ? 'Wednesday' :
                                        day === 'Thu' ? 'Thursday' :
                                        day === 'Fri' ? 'Friday' :
                                        'Saturday'}
                                     </h6>
                                     <span className={`badge ${availability?.is_available ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                                       {availability?.is_available ? 'Open' : 'Closed'}
                                     </span>
                                   </div>
                                   {availability?.is_available && availability.time_slots && availability.time_slots.length > 0 ? (
                                     <div>
                                       {availability.time_slots.map((slot, index) => (
                                         <div key={slot.uid || index} className="d-flex align-items-center">
                                           <div className="d-flex align-items-center me-2">
                                             <div
                                               className="rounded-circle"
                                               style={{
                                                 width: '8px',
                                                 height: '8px',
                                                 backgroundColor: '#28a745'
                                               }}
                                             />
                                           </div>
                                           <small className="text-muted" style={{ fontSize: '12px' }}>
                                             {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                           </small>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     <small className="text-muted" style={{ fontSize: '12px' }}>
                                       Closed
                                     </small>
                                   )}
                                 </div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   </div>
                 )}

                {/* Shop Services */}
                {selectedPartner.shop_services && selectedPartner.shop_services.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Shop Services</h6>
                      <div className="row">
                        {selectedPartner.shop_services.map((service, index) => (
                          <div key={service.uid} className="col-md-6 mb-3">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                  {service.service_image && (
                                    <div
                                      className="rounded me-3"
                                      style={{
                                        width: '50px',
                                        height: '50px',
                                        backgroundImage: `url(${service.service_image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: '2px solid #e9ecef'
                                      }}
                                    />
                                  )}
                                  <div>
                                    <h6 className="mb-1" style={{ fontWeight: '600', color: '#2c3e50' }}>
                                      {service.service}
                                    </h6>
                                    <small className="text-muted">
                                      Duration: {service.duration} • Price: ₹{service.dis_price || service.mrp_price}
                                    </small>
                                  </div>
                                </div>
                                {service.service_types && service.service_types.length > 0 && (
                                  <div className="mt-2">
                                    <small className="text-muted">Service Types:</small>
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                      {service.service_types.map((type, typeIndex) => (
                                        <span key={type.uid} className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                          {type.type_name} - ₹{type.dis_price}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Information */}
                {selectedPartner.staff_info && selectedPartner.staff_info.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Staff Information</h6>
                      <div className="row">
                        {selectedPartner.staff_info.map((staff, index) => (
                          <div key={staff.uid} className="col-md-6 mb-3">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                  {staff.staff_image && (
                                    <div
                                      className="rounded-circle me-3"
                                      style={{
                                        width: '50px',
                                        height: '50px',
                                        backgroundImage: `url(${staff.staff_image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: '2px solid #e9ecef'
                                      }}
                                    />
                                  )}
                                  <div>
                                    <h6 className="mb-1" style={{ fontWeight: '600', color: '#2c3e50' }}>
                                      {staff.first_name} {staff.last_name}
                                    </h6>
                                    <small className="text-muted">
                                      Phone: {staff.phone_number}
                                    </small>
                                  </div>
                                </div>
                                {staff.service_name && staff.service_name.length > 0 && (
                                  <div className="mt-2">
                                    <small className="text-muted">Services:</small>
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                      {staff.service_name.map((serviceName, serviceIndex) => (
                                        <span key={serviceIndex} className="badge bg-primary" style={{ fontSize: '10px' }}>
                                          {serviceName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPartner(null)}>Close</button>
                <button type="button" className="btn btn-danger me-2" onClick={() => handleRejectPartner(selectedPartner)}>
                  <FaTimes className="me-2" />
                  Reject
                </button>
                <button type="button" className="btn btn-success" onClick={() => handleApprovePartner(selectedPartner)}>
                  <FaCheck className="me-2" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerReviewScreen;
