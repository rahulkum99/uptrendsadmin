import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';

const AddSalonScreen = () => {
  const { user, access_token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    salonName: '',
    salonType: '',
    membership: 'Basic Membership',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '18:00',
    description: ''
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form data:', formData);
      toast.success('Partner added successfully!');
      
      // Redirect back to partners page after a short delay
      setTimeout(() => {
        window.location.href = '/partners';
      }, 1500);
    } catch (error) {
      toast.error('Failed to add partner. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                    Add New Partner
                  </h2>
                  <p className="text-muted mb-0">Create a new salon partner</p>
                </div>
                <button
                  onClick={() => window.location.href = '/partners'}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Partners
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-plus me-2"></i>
                    Partner Information
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Partner Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="salonName"
                            value={formData.salonName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Partner Type *</label>
                          <select
                            className="form-select"
                            name="salonType"
                            value={formData.salonType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select partner type</option>
                            <option value="Beauty Salon">Beauty Salon</option>
                            <option value="Hair Salon">Hair Salon</option>
                            <option value="Spa">Spa</option>
                            <option value="Nail Salon">Nail Salon</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Email Address *</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address *</label>
                          <textarea
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            required
                          ></textarea>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">City *</label>
                              <input
                                type="text"
                                className="form-control"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">State *</label>
                              <input
                                type="text"
                                className="form-control"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Pincode *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            maxLength="6"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="d-flex justify-content-end gap-3">
                                            <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.href = '/partners'}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Adding...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus me-2"></i>
                                Add Partner
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AddSalonScreen;
