import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const PartnersScreen = () => {
  console.log('PartnersScreen component mounted/re-rendered');
  const { user, is_verified } = useAuth();
  
  useEffect(() => {
    console.log('PartnersScreen component mounted');
    return () => {
      console.log('PartnersScreen component unmounted');
    };
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for salons
  const [salons, setSalons] = useState([
    {
      id: 1,
      name: "The Beauty Lounge",
      salonId: "123435",
      membership: "Premium Membership",
      location: "New Delhi",
      address: "Square Mall, Vasant Vihar",
      status: "Active",
      revenue: "₹1,33,453",
      rating: 4.8,
      image: "https://via.placeholder.com/40x40/667eea/ffffff?text=BL"
    },
    {
      id: 2,
      name: "Glamour Studio",
      salonId: "123436",
      membership: "Standard Membership",
      location: "Mumbai",
      address: "Phoenix MarketCity, Kurla",
      status: "Active",
      revenue: "₹98,234",
      rating: 4.6,
      image: "https://via.placeholder.com/40x40/764ba2/ffffff?text=GS"
    },
    {
      id: 3,
      name: "Elegance Salon",
      salonId: "123437",
      membership: "Premium Membership",
      location: "Bangalore",
      address: "UB City, Vittal Mallya Road",
      status: "Inactive",
      revenue: "₹1,45,678",
      rating: 4.9,
      image: "https://via.placeholder.com/40x40/e74c3c/ffffff?text=ES"
    },
    {
      id: 4,
      name: "Style Hub",
      salonId: "123438",
      membership: "Basic Membership",
      location: "Chennai",
      address: "Express Avenue, Royapettah",
      status: "Active",
      revenue: "₹76,543",
      rating: 4.4,
      image: "https://via.placeholder.com/40x40/f39c12/ffffff?text=SH"
    },
    {
      id: 5,
      name: "Luxe Beauty",
      salonId: "123439",
      membership: "Premium Membership",
      location: "Hyderabad",
      address: "Inorbit Mall, Cyberabad",
      status: "Active",
      revenue: "₹1,12,345",
      rating: 4.7,
      image: "https://via.placeholder.com/40x40/27ae60/ffffff?text=LB"
    }
  ]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Filter and search salons
  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salon.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salon.salonId.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || salon.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSalons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSalons = filteredSalons.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditSalon = (salonId) => {
    console.log('Edit salon:', salonId);
    // Navigate to edit salon page
  };

  const handleToggleStatus = (salonId) => {
    setSalons(prevSalons => 
      prevSalons.map(salon => 
        salon.id === salonId 
          ? { ...salon, status: salon.status === 'Active' ? 'Inactive' : 'Active' }
          : salon
      )
    );
  };

  const handleAddNewSalon = () => {
    console.log('Add new salon');
    // Navigate to add salon page
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
                                                     placeholder="Search partners by name, location, or ID..."
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
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
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

          {/* Salons Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                                                     <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>PARTNER</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>LOCATION</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>STATUS</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>REVENUE</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>RATING</th>
                          <th style={{ border: 'none', padding: '15px', fontWeight: '600', color: '#2c3e50' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSalons.map((salon) => (
                          <tr key={salon.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div className="d-flex align-items-center">
                                <img
                                  src={salon.image}
                                  alt={salon.name}
                                  className="rounded-circle me-3"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div style={{ fontWeight: '600', color: '#2c3e50' }}>{salon.name}</div>
                                  <small className="text-muted">ID: #{salon.salonId} | {salon.membership}</small>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div>
                                <div style={{ fontWeight: '500', color: '#2c3e50' }}>{salon.location}</div>
                                <small className="text-muted">{salon.address}</small>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <span
                                className={`badge ${salon.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}
                                style={{ padding: '8px 12px', borderRadius: '20px', fontSize: '12px' }}
                              >
                                {salon.status}
                              </span>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: '600', color: '#2c3e50' }}>{salon.revenue}</div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div className="d-flex align-items-center">
                                <span style={{ fontWeight: '600', color: '#2c3e50' }}>{salon.rating}</span>
                                <span className="ms-1" style={{ color: '#f39c12' }}>★</span>
                              </div>
                            </td>
                            <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => handleEditSalon(salon.id)}
                                  className="btn btn-sm btn-outline-primary"
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(salon.id)}
                                  className={`btn btn-sm ${salon.status === 'Active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                  {salon.status === 'Active' ? 'Disable' : 'Enable'}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredSalons.length)} of {filteredSalons.length} results
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

export default PartnersScreen;
