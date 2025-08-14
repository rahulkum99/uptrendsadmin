import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';

const Dashboard = () => {
  const { user, logout, isLoading, is_verified } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            Uptrends Partners Admin
          </a>
          <div className="navbar-nav ms-auto">
            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Welcome to Dashboard</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5>User Information</h5>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{user?.email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Account Status:</strong></td>
                          <td>
                            <span className={`badge ${is_verified ? 'bg-success' : 'bg-warning'}`}>
                              {is_verified ? 'Verified' : 'Not Verified'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Login Time:</strong></td>
                          <td>{new Date().toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h5>Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary">
                        Manage Users
                      </button>
                      <button className="btn btn-outline-secondary">
                        View Reports
                      </button>
                      <button className="btn btn-outline-info">
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-primary">150</h3>
                <p className="card-text">Total Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-success">89</h3>
                <p className="card-text">Active Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-info">25</h3>
                <p className="card-text">New This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
