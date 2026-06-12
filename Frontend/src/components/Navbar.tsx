import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, LogOut, ShieldAlert, LogIn, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Film className="logo-icon" />
          <span>Cine<span className="accent-text">Pass</span></span>
        </Link>

        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Movies
          </NavLink>
          
          {isAuthenticated && (
            <NavLink 
              to="/my-bookings" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Ticket className="nav-icon" size={16} />
              My Bookings
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <ShieldAlert className="nav-icon" size={16} />
              Admin Panel
            </NavLink>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="navbar-user-menu">
              <div className="user-badge">
                <User size={14} className="user-icon" />
                <span className="username">{user?.name}</span>
                {isAdmin && <span className="admin-tag">Admin</span>}
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              <LogIn size={16} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
