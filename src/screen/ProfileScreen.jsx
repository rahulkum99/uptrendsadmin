import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS, apiCall } from '../utils/api';
import { store } from '../redux/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfileScreen = () => {
  console.log('ProfileScreen component mounted/re-rendered');
  const { user, access_token } = useAuth();
  
  useEffect(() => {
    console.log('ProfileScreen component mounted');
    return () => {
      console.log('ProfileScreen component unmounted');
    };
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    bio: '',
    profile_picture: '',
    date_of_birth: '',
    gender: '',
    first_name: '',
    last_name: '',
    user_email: '',
    user_phone_number: ''
  });

  const [originalData, setOriginalData] = useState({
    bio: '',
    profile_picture: '',
    date_of_birth: '',
    gender: '',
    first_name: '',
    last_name: '',
    user_email: '',
    user_phone_number: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);

  // Fetch existing profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall(API_ENDPOINTS.PROFILE, { method: 'GET' }, store);
      if (data) {
        setExistingProfile(data);
        const profileDataObj = {
          bio: data.bio || '',
          profile_picture: data.profile_picture || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          user_email: data.user_email || '',
          user_phone_number: data.user_phone_number || ''
        };
        setProfileData(profileDataObj);
        setOriginalData(profileDataObj);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF)');
        e.target.value = ''; // Clear the input
        return;
      }

      setSelectedFile(file);
      toast.success('Image selected successfully!');

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to get only changed fields
  const getChangedFields = () => {
    const changedFields = {};

    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== originalData[key]) {
        changedFields[key] = profileData[key];
      }
    });

    // If a file is selected, include it
    if (selectedFile) {
      changedFields.profile_picture = selectedFile;
    }

    return changedFields;
  };

  // Function to check if a field has been modified
  const isFieldChanged = (fieldName) => {
    return profileData[fieldName] !== originalData[fieldName];
  };

  // Function to reset changes
  const resetChanges = () => {
    setProfileData(originalData);
    setSelectedFile(null);
    setPreviewUrl('');
    toast.info('Changes have been reset');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Get only changed fields
    const changedFields = getChangedFields();

    // Check if there are any changes
    if (Object.keys(changedFields).length === 0 && !selectedFile) {
      toast.info('No changes detected');
      setIsSaving(false);
      return;
    }

    // Debug: Log the data being sent
    console.log('Original data:', originalData);
    console.log('Current data:', profileData);
    console.log('Changed fields:', changedFields);
    console.log('Selected file:', selectedFile);
    console.log('API Endpoint:', API_ENDPOINTS.PROFILE);

    try {
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      if (selectedFile) {
        // If file is selected, use FormData
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);

        // Only append changed fields
        Object.keys(changedFields).forEach(key => {
          if (key !== 'profile_picture') {
            formData.append(key, changedFields[key]);
          }
        });

        requestBody = formData;
        // Don't set Content-Type for FormData, let browser set it with boundary
      } else {
        // If no file, use JSON with only changed fields
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(changedFields);
      }

      // Use apiCall helper for PUT. If sending FormData, pass it through and let helper avoid forcing Content-Type.
      const data = await apiCall(
        API_ENDPOINTS.PROFILE,
        {
          method: 'PUT',
          headers,
          body: requestBody,
        },
        store
      );

      if (data) {
        console.log('Profile update successful:', data);
        setExistingProfile(data);

        // Update original data to reflect the new state
        const updatedProfileData = {
          bio: data.bio || '',
          profile_picture: data.profile_picture || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          user_email: data.user_email || '',
          user_phone_number: data.user_phone_number || ''
        };
        setOriginalData(updatedProfileData);
        setProfileData(updatedProfileData);

        // Clear file selection after successful upload
        setSelectedFile(null);
        setPreviewUrl('');

        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
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
        marginTop: '64px', // Account for fixed header
        width: `calc(100vw - ${sidebarCollapsed ? '80px' : '280px'})`,
        minHeight: 'calc(100vh - 64px)',
        transition: 'all 0.3s ease',
        overflow: 'auto'
      }}>
        <div className="container-fluid p-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Profile Management
                  </h4>
                </div>
                <div className="card-body">
                  {/* Changes Summary */}
                  {(() => {
                    const changedFields = getChangedFields();
                    const hasChanges = Object.keys(changedFields).length > 0 || selectedFile;

                    if (hasChanges) {
                      return (
                        <div className="alert alert-info mb-4">
                          <h6 className="alert-heading">
                            <i className="fas fa-info-circle me-2"></i>
                            Changes Detected
                          </h6>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <p className="mb-2">The following fields have been modified:</p>
                              <ul className="mb-0">
                                {Object.keys(changedFields).map(field => (
                                  <li key={field}>
                                    <strong>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                                    {field === 'profile_picture' && selectedFile ? ` ${selectedFile.name}` : ` ${changedFields[field]}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm ms-3"
                              onClick={resetChanges}
                            >
                              <i className="fas fa-undo me-1"></i>
                              Reset Changes
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Personal Information */}
                      <div className="col-md-6">
                        <h5 className="mb-3 text-primary">Personal Information</h5>

                        <div className="mb-3">
                          <label className="form-label">
                            First Name *
                            {isFieldChanged('first_name') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <input
                            type="text"
                            className={`form-control ${isFieldChanged('first_name') ? 'border-warning' : ''}`}
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Last Name *
                            {isFieldChanged('last_name') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <input
                            type="text"
                            className={`form-control ${isFieldChanged('last_name') ? 'border-warning' : ''}`}
                            name="last_name"
                            value={profileData.last_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            name="user_email"
                            value={profileData.user_email}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                          />
                          <small className="text-muted">Email cannot be changed</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number
                            {isFieldChanged('user_phone_number') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            className={`form-control ${isFieldChanged('user_phone_number') ? 'border-warning' : ''}`}
                            name="user_phone_number"
                            value={profileData.user_phone_number}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="col-md-6">
                        <h5 className="mb-3 text-primary">Additional Information</h5>

                        <div className="mb-3">
                          <label className="form-label">
                            Date of Birth
                            {isFieldChanged('date_of_birth') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <input
                            type="date"
                            className={`form-control ${isFieldChanged('date_of_birth') ? 'border-warning' : ''}`}
                            name="date_of_birth"
                            value={profileData.date_of_birth}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Gender
                            {isFieldChanged('gender') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <select
                            className={`form-select ${isFieldChanged('gender') ? 'border-warning' : ''}`}
                            name="gender"
                            value={profileData.gender}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Profile Picture
                            {selectedFile && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <div className="d-flex align-items-center gap-3">
                            <div className="flex-grow-1">
                              <input
                                type="file"
                                className={`form-control ${selectedFile ? 'border-warning' : ''}`}
                                accept="image/*"
                                onChange={handleFileChange}
                                id="profile-picture-input"
                              />
                              <small className="text-muted">Accepted formats: JPG, PNG, GIF (Max 5MB)</small>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Bio
                            {isFieldChanged('bio') && (
                              <span className="badge bg-warning text-dark ms-2">Modified</span>
                            )}
                          </label>
                          <textarea
                            className={`form-control ${isFieldChanged('bio') ? 'border-warning' : ''}`}
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Profile Picture Preview */}
                    {(profileData.profile_picture || previewUrl) && (
                      <div className="row mt-3">
                        <div className="col-12">
                          <h6>Profile Picture Preview:</h6>
                          <div className="d-flex gap-3 align-items-center">
                            <img
                              src={previewUrl || profileData.profile_picture}
                              alt="Profile"
                              className="img-thumbnail"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {selectedFile && (
                              <div>
                                <p className="mb-1"><strong>Selected File:</strong></p>
                                <p className="mb-1 text-muted">{selectedFile.name}</p>
                                <p className="mb-0 text-muted">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              {existingProfile ? 'Update Profile' : 'Create Profile'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Current Profile Display */}
                  {existingProfile && (
                    <div className="row mt-5">
                      <div className="col-12">
                        <div className="card border-info">
                          <div className="card-header bg-info text-white">
                            <h6 className="mb-0">Current Profile Information</h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <p><strong>Name:</strong> {existingProfile.first_name} {existingProfile.last_name}</p>
                                <p><strong>Email:</strong> {existingProfile.user_email}</p>
                                <p><strong>Phone:</strong> {existingProfile.user_phone_number || 'Not provided'}</p>
                                <p><strong>Date of Birth:</strong> {existingProfile.date_of_birth || 'Not provided'}</p>
                              </div>
                              <div className="col-md-6">
                                <p><strong>Gender:</strong> {existingProfile.gender || 'Not specified'}</p>
                                <p><strong>Bio:</strong> {existingProfile.bio || 'No bio provided'}</p>
                                <p><strong>Verified:</strong> {existingProfile.is_verified ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>
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

export default ProfileScreen;
