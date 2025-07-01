import React from 'react';

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className = '' }) => {
  return (
    <nav className={`navbar ${className}`} data-testid="nav-bar">
      <div className="navbar-brand">
        <h1>Cliniio 2.0</h1>
      </div>
      <div className="navbar-menu">
        <a href="/" className="nav-link">
          Home
        </a>
        <a href="/inventory" className="nav-link">
          Inventory
        </a>
        <a href="/knowledge-hub" className="nav-link">
          Knowledge Hub
        </a>
        <a href="/settings" className="nav-link">
          Settings
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
