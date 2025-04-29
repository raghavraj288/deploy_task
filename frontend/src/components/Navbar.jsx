// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onAddClick }) {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h2>MyShop</h2>
      {user && (
        <div className="nav-actions">
          <button onClick={onAddClick}>Add Product</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
