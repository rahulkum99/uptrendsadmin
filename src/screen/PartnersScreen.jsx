import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useGetPartnersQuery, useUpdatePartnerStatusMutation, useDeletePartnerMutation } from '../redux/api/partnerApi';
import { toast } from 'react-toastify';
import { FaUsers, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const PartnersScreen = () => {
  console.log('PartnersScreen component mounted/re-rendered');
  const { user } = useAuth();

  useEffect(() => {
    console.log('PartnersScreen component mounted');
    return () => {
      console.log('PartnersScreen component unmounted');
    };
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);

    // RTK Query hooks
  const { 
    data: partnerResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetPartnersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
  }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Debug logging for pagination issues
  React.useEffect(() => {
    console.log('Partners query params changed:', {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
    });
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  React.useEffect(() => {
    if (error) {
      console.error('Partners query error:', error);
    }
  }, [error]);

  const [updatePartnerStatus] = useUpdatePartnerStatusMutation();
  const [deletePartner] = useDeletePartnerMutation();

  // Extract partners from paginated response
  const partners = partnerResponse?.results || [];
  const pagination = partnerResponse?.results ? {
    count: partnerResponse.count,
    totalPages: partnerResponse.total_pages,
    next: partnerResponse.next,
    previous: partnerResponse.previous
  } : null;

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = pagination?.count || partners.length;
    const active = partners.filter(p => p.is_active).length;
    const withServices = partners.filter(p => p.service_type_display && p.service_type_display.length > 0).length;
    const withContact = partners.filter(p => p.contact_number || p.email).length;
    const withLocation = partners.filter(p => p.latitude && p.longitude).length;
    const withDescription = partners.filter(p => p.description && p.description.trim()).length;
    const totalServices = partners.reduce((acc, p) => acc + (p.service_type_display?.length || 0), 0);

    return { total, active, withServices, withContact, withLocation, withDescription, totalServices };
  }, [partners, pagination]);

  // Calculate pagination info
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || partners.length) / pageSize);
  const hasNextPage = pagination?.next !== null;
  const hasPrevPage = pagination?.previous !== null;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleEditPartner = (partner) => {
    console.log('Edit partner:', partner);
    // Navigate to edit partner page
  };

  const handleToggleStatus = async (partner) => {
    try {
      await updatePartnerStatus({
        uid: partner.uid,
        is_active: !partner.is_active
      }).unwrap();
      toast.success(`Partner ${partner.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast.error('Failed to update partner status');
    }
  };

  const handleDeletePartner = async (partner) => {
    if (window.confirm(`Are you sure you want to delete ${partner.service_name}?`)) {
      try {
        await deletePartner(partner.uid).unwrap();
        toast.success('Partner deleted successfully');
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
  };

  const closeModal = () => {
    setSelectedPartner(null);
  };

  const handleAddNewSalon = () => {
    console.log('Add new partner');
    // Navigate to add salon page
    window.location.href = '/add-salon';
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
      <style>
        {`
          .partner-row:hover {
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
                    Partners Management
                  </h2>
                  <p className="text-muted mb-0">Manage all your salon partners and their details</p>
                </div>
                <button
                  onClick={handleAddNewSalon}
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
                  Add New Partner
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
                      <small>Total Partners</small>
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
                      <FaToggleOn size={20} />
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
                      <h4 className="mb-0">{stats.totalServices}</h4>
                      <small>Total Services</small>
                    </div>
                    <div className="align-self-center">
                      <FaUsers size={20} />
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
            {/* <div className="col-md-2">
              <div className="card bg-dark text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4 className="mb-0">{stats.withDescription}</h4>
                      <small>With Description</small>
                    </div>
                    <div className="align-self-center">
                      <FaEnvelope size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
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
                          <i className="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search partners by name, location, or service..."
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={clearFilters}
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
                        <h5 className="mb-0" style={{ fontWeight: '700', fontSize: '18px' }}>Partner List</h5>
                        <small className="opacity-75" style={{ fontSize: '13px' }}>Manage your salon partners</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                      {pagination && (
                        <div className="text-center">
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>{pagination.count}</div>
                          <small className="opacity-75" style={{ fontSize: '11px' }}>Total Partners</small>
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
                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading partners...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-5">
                      <FaUsers size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Error loading partners</h5>
                      <p className="text-muted">{error?.data?.message || 'Something went wrong'}</p>
                      <button className="btn btn-primary" onClick={refetch}>
                        Try Again
                      </button>
                    </div>
                  ) : partners.length === 0 ? (
                    <div className="text-center py-5">
                      <FaUsers size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No partners found</h5>
                      <p className="text-muted">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <div className="d-flex align-items-center">
                                <FaUsers className="me-2" size={16} />
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
                                <FaToggleOn className="me-2" size={16} />
                                Status
                              </div>
                            </th>
                           
                            <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                              Actions
                            </th>
                            {/* <th style={{ border: 'none', padding: '20px 15px', fontWeight: '700', color: '#495057', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                              Coordinates
                            </th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {partners.map((partner, index) => (
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
                                    {partner.service_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '16px', marginBottom: '4px' }}>
                                      {partner.service_name}
                                    </div>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                      {/* <small className="text-muted" style={{ fontSize: '12px' }}>
                                        <strong>ID:</strong> {partner.uid.slice(0, 8)}...
                                      </small> */}
                                      <small className="text-muted" style={{ fontSize: '12px' }}>
                                        <strong>Est.</strong> {partner.established_year}
                                      </small>
                                    </div>
                                    {/* {partner.description && (
                                      <small className="text-muted" style={{ fontSize: '11px', lineHeight: '1.3', display: 'block' }}>
                                        {partner.description.length > 80 ? `${partner.description.substring(0, 80)}...` : partner.description}
                                      </small>
                                    )} */}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div>
                                  <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px', marginBottom: '4px' }}>
                                    {partner.city}, {partner.state}
                                  </div>
                                  <div className="d-flex flex-column gap-1">
                                    {partner.address && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        {partner.address}
                                      </small>
                                    )}
                                    {partner.address2 && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        {partner.address2}
                                      </small>
                                    )}
                                    {partner.landmark && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4', color: '#6c757d' }}>
                                        <strong>Landmark:</strong> {partner.landmark}
                                      </small>
                                    )}
                                    {partner.pincode && (
                                      <small className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                        <strong>PIN:</strong> {partner.pincode}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex flex-column gap-2">
                                  {partner.service_type_display?.map((service, index) => (
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
                                  {partner.contact_number && (
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
                                        {partner.contact_number}
                                      </small>
                                    </div>
                                  )}
                                  {partner.email && (
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
                                        {partner.email}
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
                                      backgroundColor: partner.is_active ? '#e8f5e8' : '#f5f5f5',
                                      color: partner.is_active ? '#2e7d32' : '#757575',
                                      border: `2px solid ${partner.is_active ? '#4caf50' : '#bdbdbd'}`
                                    }}
                                  >
                                    <div
                                      className="rounded-circle"
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: partner.is_active ? '#4caf50' : '#bdbdbd'
                                      }}
                                    ></div>
                                    {partner.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    onClick={() => handleViewDetails(partner)}
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
                                    <FaUsers size={10} className="me-1" />
                                    View
                                  </button>
                                  {/* <button
                                    onClick={() => handleEditPartner(partner)}
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
                                    <FaEdit size={10} className="me-1" />
                                    Edit
                                  </button> */}
                                  <button
                                    onClick={() => handleToggleStatus(partner)}
                                    className={`btn btn-sm`}
                                    style={{
                                      backgroundColor: partner.is_active ? '#ffebee' : '#e8f5e8',
                                      border: `1px solid ${partner.is_active ? '#ffcdd2' : '#c8e6c9'}`,
                                      color: partner.is_active ? '#c62828' : '#2e7d32',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.backgroundColor = partner.is_active ? '#ffcdd2' : '#c8e6c9';
                                      e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.backgroundColor = partner.is_active ? '#ffebee' : '#e8f5e8';
                                      e.target.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    {partner.is_active ? <FaToggleOff size={10} className="me-1" /> : <FaToggleOn size={10} className="me-1" />}
                                    {partner.is_active ? 'Disable' : 'Enable'}
                                  </button>
                                  <button
                                    onClick={() => handleDeletePartner(partner)}
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
                              {/* <td style={{ padding: '20px 15px', verticalAlign: 'middle' }}>
                                 <div className="d-flex flex-column align-items-center">
                                   {partner.latitude && partner.longitude ? (
                                     <>
                                       <div className="d-flex align-items-center gap-1 mb-1">
                                         <div 
                                           className="rounded-circle d-flex align-items-center justify-content-center"
                                           style={{ 
                                             width: '20px', 
                                             height: '20px', 
                                             backgroundColor: '#e8f5e8',
                                             color: '#2e7d32'
                                           }}
                                         >
                                           <FaMapMarkerAlt size={8} />
                                         </div>
                                         <small style={{ fontSize: '11px', fontWeight: '600', color: '#2c3e50' }}>
                                           {parseFloat(partner.latitude).toFixed(4)}
                                         </small>
                                       </div>
                                       <div className="d-flex align-items-center gap-1">
                                         <div 
                                           className="rounded-circle d-flex align-items-center justify-content-center"
                                           style={{ 
                                             width: '20px', 
                                             height: '20px', 
                                             backgroundColor: '#fff3e0',
                                             color: '#f57c00'
                                           }}
                                         >
                                           <FaMapMarkerAlt size={8} />
                                         </div>
                                         <small style={{ fontSize: '11px', fontWeight: '600', color: '#2c3e50' }}>
                                           {parseFloat(partner.longitude).toFixed(4)}
                                         </small>
                                       </div>
                                     </>
                                   ) : (
                                     <small className="text-muted" style={{ fontSize: '11px' }}>
                                       Not available
                                     </small>
                                   )}
                                 </div>
                               </td> */}
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
                          <nav aria-label="Partner pagination">
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
                    {selectedPartner.service_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{selectedPartner.service_name}</h5>
                    <small className="opacity-75">Partner Details</small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Basic Information</h6>
                    <div className="mb-3">
                      <strong>Partner ID:</strong> {selectedPartner.uid}
                    </div>
                    <div className="mb-3">
                      <strong>Established:</strong> {selectedPartner.established_year}
                    </div>
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${selectedPartner.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedPartner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {selectedPartner.description && (
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="mt-2 text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {selectedPartner.description}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>Contact Information</h6>
                    {selectedPartner.contact_number && (
                      <div className="mb-3">
                        <strong>Phone:</strong> {selectedPartner.contact_number}
                      </div>
                    )}
                    {selectedPartner.email && (
                      <div className="mb-3">
                        <strong>Email:</strong> {selectedPartner.email}
                      </div>
                    )}
                    {selectedPartner.latitude && selectedPartner.longitude && (
                      <div className="mb-3">
                        <strong>Coordinates:</strong><br />
                        <small className="text-muted">
                          Lat: {parseFloat(selectedPartner.latitude).toFixed(6)}<br />
                          Lng: {parseFloat(selectedPartner.longitude).toFixed(6)}
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
                          <strong>City:</strong> {selectedPartner.city}
                        </div>
                        <div className="mb-2">
                          <strong>State:</strong> {selectedPartner.state}
                        </div>
                        {selectedPartner.pincode && (
                          <div className="mb-2">
                            <strong>Pincode:</strong> {selectedPartner.pincode}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        {selectedPartner.address && (
                          <div className="mb-2">
                            <strong>Address:</strong> {selectedPartner.address}
                          </div>
                        )}
                        {selectedPartner.address2 && (
                          <div className="mb-2">
                            <strong>Address 2:</strong> {selectedPartner.address2}
                          </div>
                        )}
                        {selectedPartner.landmark && (
                          <div className="mb-2">
                            <strong>Landmark:</strong> {selectedPartner.landmark}
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
                      {selectedPartner.service_type_display?.map((service, index) => (
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditPartner(selectedPartner)}>
                  Edit Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersScreen;
