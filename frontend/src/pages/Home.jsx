import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="home-box">
        <h1>Welcome</h1>
        <div className="home-buttons">
          <button onClick={() => navigate('/register')}>Register</button>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    </div>
  );
}
